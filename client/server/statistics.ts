'use server';

import { prisma } from './prisma';

export async function getStatistics() {
  try {
    return {
      totalUsers: await totalUsers(),
      totalDocumentRequested: await totalDocumentRequested(),
      totalRevenue: await totalRevenue(),
      totalDocumentPaidRequested: await totalDocumentPaidRequested()
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

async function totalUsers() {
  try {
    return (await prisma.users.count()) - 1;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

async function totalDocumentRequested() {
  try {
    const totalRequested = await prisma.requestDocuments.findMany({
      select: {
        id: true,
        createdAt: true,
        status: true,
        documentPayment: {
          select: {
            referenceNumber: true
          }
        },
        DocumentSelected: {
          select: {
            document: {
              select: { name: true }
            }
          }
        }
      }
    });

    const dailyRequestMap: Record<
      string,
      { date: string; status: string; documentType: string; transactionRef: string; totalRequests: number }
    > = {};

    totalRequested.forEach((doc) => {
      const date = doc.createdAt.toISOString().split('T')[0];
      const status = doc.status ?? 'PENDING';
      const transactionRef = doc.documentPayment?.referenceNumber ?? doc.id;
      const docNames = doc.DocumentSelected.map((ds) => ds.document.name);
      const uniqueNames = docNames.length > 0 ? Array.from(new Set(docNames)) : ['Unknown'];

      uniqueNames.forEach((docType) => {
        const key = `${date}__${status}__${docType}__${transactionRef}`;
        if (!dailyRequestMap[key]) {
          dailyRequestMap[key] = { date, status, documentType: docType, transactionRef, totalRequests: 0 };
        }
        dailyRequestMap[key].totalRequests += 1;
      });
    });

    const dailyRequestData = Object.values(dailyRequestMap);

    const allDocumentTypes = Array.from(new Set(dailyRequestData.map((d) => d.documentType))).sort();

    /** Every document on Transaction List (/dashboard/documents) — used for chart filter dropdown */
    const transactionListDocuments = (
      await prisma.documents.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
      })
    ).map((d) => d.name);

    const dailyTotalsMap: Record<string, number> = {};
    dailyRequestData.forEach(({ date, totalRequests }) => {
      dailyTotalsMap[date] = (dailyTotalsMap[date] || 0) + totalRequests;
    });
    const dailyTotals = Object.entries(dailyTotalsMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let percentageChangeFromLastData = 0;
    if (dailyTotals.length > 1) {
      const lastData = dailyTotals[dailyTotals.length - 1];
      const previousData = dailyTotals[dailyTotals.length - 2];
      percentageChangeFromLastData =
        ((lastData.total - previousData.total) / previousData.total) * 100;
    }

    return {
      dailyRequestData,
      allDocumentTypes,
      transactionListDocuments,
      percentageChangeFromLastData,
      totalRequested: totalRequested.length
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

async function totalDocumentPaidRequested() {
  try {
    const result = await prisma.requestDocuments.count({
      where: {
        status: 'PAID'
      }
    });
    return result;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

async function totalRevenue() {
  try {
    const result = await prisma.documentSelected.findMany({
      where: {
        requestDocument: {
          documentPayment: {
            status: 'PAID'
          }
        }
      },
      include: {
        document: {
          select: {
            price: true
          }
        }
      }
    });

    const totalSelectedPrice = result.reduce((sum, doc) => {
      return sum + (Number(doc.document.price) || 0);
    }, 0);

    // Group by date and sum the prices
    const dailyRevenueMap = result.reduce(
      (acc, doc) => {
        const date = doc.createdAt.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(doc.document.price) || 0;
        return acc;
      },
      {} as Record<string, number>
    );

    // Convert the map to an array of objects
    const dailyRevenueData = Object.entries(dailyRevenueMap).map(([date, revenue]) => ({
      date,
      revenue
    }));

    let percentageChangeFromLastData = 0;
    if (dailyRevenueData.length > 1) {
      const lastData = dailyRevenueData[dailyRevenueData.length - 1];
      const previousData = dailyRevenueData[dailyRevenueData.length - 2];
      percentageChangeFromLastData = ((lastData.revenue - previousData.revenue) / previousData.revenue) * 100;
    }

    return {
      totalSelectedPrice,
      dailyRevenueData,
      percentageChangeFromLastData
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Dashboard CSV: (1) summary KPIs (2) requested document line items by date, status, document type.
 */
export async function exportDashboardCsv(): Promise<{ content: string; error?: string }> {
  try {
    const stats = await getStatistics();
    if (!stats) return { content: '', error: 'Could not load statistics.' };

    const row = (...cells: unknown[]) => cells.map(csvCell).join(',');
    const lines: string[] = [];

    // ── Part 1: Requested documents — summary (matches dashboard cards) ──
    lines.push(row('Requested documents — dashboard export'));
    lines.push(row('Generated (UTC)', new Date().toISOString()));
    lines.push('');
    lines.push(row('Part 1 — Summary'));
    lines.push(row('Metric', 'Value'));
    lines.push(row('Total revenue (PHP)', Number(stats.totalRevenue?.totalSelectedPrice ?? 0).toFixed(2)));
    lines.push(row('Total users', Number(stats.totalUsers ?? 0)));
    lines.push(row('Total paid documents', Number(stats.totalDocumentPaidRequested ?? 0)));
    lines.push(row('Total document requested', Number(stats.totalDocumentRequested?.totalRequested ?? 0)));

    // ── Part 2: By day, status, and document (line-item counts) ──
    const dailyReq = stats.totalDocumentRequested?.dailyRequestData ?? [];
    type RowKey = string;
    const byDateStatus: Record<RowKey, number> = {};
    const byDateStatusDoc: Record<RowKey, number> = {};

    for (const d of dailyReq) {
      const k1 = `${d.date}\u0001${d.status}`;
      byDateStatus[k1] = (byDateStatus[k1] || 0) + d.totalRequests;
      const k2 = `${d.date}\u0001${d.status}\u0001${d.documentType}`;
      byDateStatusDoc[k2] = (byDateStatusDoc[k2] || 0) + d.totalRequests;
    }

    const sortKeys1 = Object.keys(byDateStatus).sort((a, b) => {
      const [da, sa] = a.split('\u0001');
      const [db, sb] = b.split('\u0001');
      const c = da.localeCompare(db);
      return c !== 0 ? c : sa.localeCompare(sb);
    });

    lines.push('');
    lines.push(row('Part 2 — Requested documents per day and status (totals)'));
    lines.push(row('Date', 'Status', 'Line items'));
    for (const k of sortKeys1) {
      const [date, status] = k.split('\u0001');
      lines.push(row(date, status, byDateStatus[k]));
    }

    const sortKeys2 = Object.keys(byDateStatusDoc).sort((a, b) => {
      const pa = a.split('\u0001');
      const pb = b.split('\u0001');
      for (let i = 0; i < 3; i++) {
        const c = pa[i].localeCompare(pb[i]);
        if (c !== 0) return c;
      }
      return 0;
    });

    lines.push('');
    lines.push(row('Part 2 — Detail by date, status, and document type'));
    lines.push(row('Date', 'Status', 'Document', 'Line items'));
    for (const k of sortKeys2) {
      const [date, status, docType] = k.split('\u0001');
      lines.push(row(date, status, docType, byDateStatusDoc[k]));
    }

    return { content: lines.join('\r\n') };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Export failed.';
    return { content: '', error: msg };
  }
}

export async function recentSales() {
  return await prisma.documentPayment.findMany({
    where: {
      status: 'PAID'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      RequestDocuments: {
        include: {
          users: {
            include: {
              UserInformation: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  studentNo: true,
                  specialOrder: true,
                  lrn: true,
                  address: true,
                  userId: true,
                  createdAt: true,
                  updatedAt: true,
                  phoneNo: true,
                  birthDate: true,
                },
              },
            },
          }
        }
      }
    }
  });
}

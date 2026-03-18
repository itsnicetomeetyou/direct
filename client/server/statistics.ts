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

/** Dashboard overview + daily stats + recent paid sales for CSV download */
export async function exportDashboardCsv(): Promise<{ content: string; error?: string }> {
  try {
    const stats = await getStatistics();
    if (!stats) return { content: '', error: 'Could not load statistics.' };

    const recentPaid = await prisma.documentPayment.findMany({
      where: { status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        RequestDocuments: {
          include: {
            users: {
              include: {
                UserInformation: {
                  select: {
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    studentNo: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const row = (...cells: unknown[]) => cells.map(csvCell).join(',');
    const lines: string[] = [];

    const dailyReq = stats.totalDocumentRequested?.dailyRequestData ?? [];
    const byDate: Record<string, number> = {};
    dailyReq.forEach((d) => {
      byDate[d.date] = (byDate[d.date] || 0) + d.totalRequests;
    });
    const sortedRequestDates = Object.keys(byDate).sort();

    lines.push(row('DiReCT Dashboard Report'));
    lines.push(row('Generated (UTC)', new Date().toISOString()));
    lines.push('');
    lines.push(row('Summary'));
    lines.push(row('Metric', 'Value'));
    lines.push(row('Total revenue (PHP)', Number(stats.totalRevenue?.totalSelectedPrice ?? 0).toFixed(2)));
    lines.push(
      row(
        'Revenue % change (last vs previous day with sales)',
        Number(stats.totalRevenue?.percentageChangeFromLastData ?? 0).toFixed(2)
      )
    );
    lines.push(row('Total users', Number(stats.totalUsers ?? 0)));
    lines.push(row('Total paid document orders (status PAID)', Number(stats.totalDocumentPaidRequested ?? 0)));
    lines.push(row('Total document requests (orders)', Number(stats.totalDocumentRequested?.totalRequested ?? 0)));
    lines.push(
      row(
        'Requests % change (last vs previous day)',
        Number(stats.totalDocumentRequested?.percentageChangeFromLastData ?? 0).toFixed(2)
      )
    );

    lines.push('');
    lines.push(row('Daily document line items requested'));
    lines.push(row('Date', 'Count'));
    sortedRequestDates.forEach((date) => lines.push(row(date, byDate[date])));

    const revenueByDay = [...(stats.totalRevenue?.dailyRevenueData ?? [])].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    lines.push('');
    lines.push(row('Daily revenue (PHP, paid line items)'));
    lines.push(row('Date', 'Revenue'));
    revenueByDay.forEach((d) => lines.push(row(d.date, Number(d.revenue).toFixed(2))));

    lines.push('');
    lines.push(row('Recent paid transactions (up to 500)'));
    lines.push(row('Reference number', 'Paid at (UTC)', 'Student name', 'Student no', 'Total amount (PHP)'));
    for (const p of recentPaid) {
      const ui = p.RequestDocuments?.users?.UserInformation;
      const studentName = ui
        ? `${ui.lastName}, ${ui.firstName}${ui.middleName ? ` ${ui.middleName}` : ''}`
        : '';
      lines.push(
        row(
          p.referenceNumber,
          p.createdAt.toISOString(),
          studentName,
          ui?.studentNo ?? '',
          p.totalAmount != null ? Number(p.totalAmount).toFixed(2) : ''
        )
      );
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

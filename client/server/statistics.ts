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

    const transactionSet = new Set<string>();

    totalRequested.forEach((doc) => {
      const date = doc.createdAt.toISOString().split('T')[0];
      const status = doc.status ?? 'PENDING';
      const transactionRef = doc.documentPayment?.referenceNumber ?? doc.id;
      transactionSet.add(transactionRef);
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
    const allTransactions = Array.from(transactionSet).sort();

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
      allTransactions,
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

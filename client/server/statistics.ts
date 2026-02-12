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
        createdAt: true
      }
    });

    // Group by date and count the requests
    const dailyRequestMap = totalRequested.reduce(
      (acc, doc) => {
        const date = doc.createdAt.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Convert the map to an array of objects
    const dailyRequestData = Object.entries(dailyRequestMap).map(([date, totalRequests]) => ({
      date,
      totalRequests
    }));

    let percentageChangeFromLastData = 0;
    if (dailyRequestData.length > 1) {
      const lastData = dailyRequestData[dailyRequestData.length - 1];
      const previousData = dailyRequestData[dailyRequestData.length - 2];
      percentageChangeFromLastData =
        ((lastData.totalRequests - previousData.totalRequests) / previousData.totalRequests) * 100;
    }

    return { dailyRequestData, percentageChangeFromLastData, totalRequested: totalRequested.length };
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
              UserInformation: true
            }
          }
        }
      }
    }
  });
}

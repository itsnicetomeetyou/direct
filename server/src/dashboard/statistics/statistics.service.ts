import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { UserAuth } from '../../../typings';

@Injectable()
export class StatisticsService {
  constructor(private prismaService: PrismaService) {}

  async findStatus(user: UserAuth) {
    const requestDocuments = await this.prismaService.requestDocuments.findMany(
      {
        where: {
          usersId: user.sub,
        },
      },
    );
    if (!requestDocuments)
      throw new NotFoundException('No request documents found');
    return this.calculateStatistics(requestDocuments);
  }

  private calculateStatistics(requestDocuments: any[]): any {
    const statusCounts = {
      cancelled: 0,
      completed: 0,
      pending: 0,
      processing: 0,
      paid: 0,
      readyToPickUp: 0,
      outForDelivery: 0,
    };

    requestDocuments.forEach((doc) => {
      switch (doc.status) {
        case 'CANCELLED':
          statusCounts.cancelled++;
          break;
        case 'COMPLETED':
          statusCounts.completed++;
          break;
        case 'PENDING':
          statusCounts.pending++;
          break;
        case 'PROCESSING':
          statusCounts.processing++;
          break;
        case 'PAID':
          statusCounts.paid++;
          break;
        case 'READYTOPICKUP':
          statusCounts.readyToPickUp++;
          break;
        case 'OUTFORDELIVERY':
          statusCounts.outForDelivery++;
          break;
      }
    });

    return statusCounts;
  }

  async findManyTransaction(user: UserAuth) {
    const response = await this.prismaService.documentPayment.findMany({
      where: {
        RequestDocuments: {
          usersId: user.sub,
        },
      },
      include: {
        RequestDocuments: true,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!response) throw new NotFoundException('No transactions found');
    return response;
  }
}

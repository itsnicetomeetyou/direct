import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryOptions } from '@prisma/client';
import { LalamoveService } from '../../../src/logistics/lalamove/lalamove.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { UserAuth } from '../../../typings';

@Injectable()
export class TrackingService {
  constructor(
    private prismaService: PrismaService,
    private lalamoveService: LalamoveService,
  ) {}

  async findOneTrackingOrder(
    orderId: string,
    logisticType: DeliveryOptions,
    user: UserAuth,
  ) {
    if (logisticType === 'LALAMOVE') {
      const checkOrderIdExists =
        await this.prismaService.requestDocuments.findFirst({
          where: {
            logisticOrderId: orderId,
            usersId: user.sub,
          },
        });
      if (!checkOrderIdExists) throw new NotFoundException('Order not found');
      const retrieveOrder = await this.lalamoveService.retrieveOrder(orderId);
      if (!retrieveOrder) throw new NotFoundException('Order not found');
      return retrieveOrder;
    }
    throw new NotFoundException('Logistic type not found');
  }
}

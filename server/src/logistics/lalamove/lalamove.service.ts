import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as LalamoveClient from '@lalamove/lalamove-js';
import { CreateOrder, CreateQuotation } from './dto/lalamove.dto';
import { IOrder } from '@lalamove/lalamove-js/dist/response/order';

@Injectable()
export class LalamoveService {
  private lalamoveClient: LalamoveClient.ClientModule;
  constructor(private configService: ConfigService) {
    this.lalamoveClient = new LalamoveClient.ClientModule(
      new LalamoveClient.Config(
        this.configService.get('LALAMOVE_API_KEY'),
        this.configService.get('LALAMOVE_API_SECRET'),
        this.configService.get('LALAMOVE_ENV'),
      ),
    );
  }

  async createQuotation(data: {
    stop1: {
      coordinates: {
        lat: CreateQuotation['lat'];
        lng: CreateQuotation['lng'];
      };
      address: CreateQuotation['address'];
    };
    stop2: {
      coordinates: {
        lat: CreateQuotation['lat'];
        lng: CreateQuotation['lng'];
      };
      address: CreateQuotation['address'];
    };
  }) {
    const stop1 = {
      coordinates: data.stop1.coordinates,
      address: data.stop1.address,
    };

    const stop2 = {
      coordinates: data.stop2.coordinates,
      address: data.stop2.address,
    };

    const quotationPayload =
      LalamoveClient.QuotationPayloadBuilder.quotationPayload()
        .withItem({
          quantity: '12',
          weight: '20',
          categories: ['PAPER/DOCUMENTS'],
        })
        .withIsRouteOptimized(true)
        .withLanguage('en_PH')
        .withServiceType('MOTORCYCLE')
        .withStops([stop1, stop2])

        .build();

    const response = await this.lalamoveClient.Quotation.create(
      'PH',
      quotationPayload,
    );

    return response;
  }

  async createOrder(data: CreateOrder): Promise<IOrder> {
    const orderPayload = LalamoveClient.OrderPayloadBuilder.orderPayload()
      .withIsPODEnabled(true)
      .withQuotationID(data.quotationId)
      .withSender({
        stopId: data.senderStopId,
        name: data.senderName,
        phone: data.senderPhoneNumber,
      })
      .withRecipients([
        {
          stopId: data.recipientStopId,
          name: data.recipientName,
          phone: data.recipientPhoneNumber,
          remarks: data.recipientRemarks,
        },
      ])
      .withMetadata({
        internalId: 'xyx211d',
      })
      .build();

    const order = await this.lalamoveClient.Order.create('PH', orderPayload);
    if (!order) throw new ForbiddenException('Failed to Create Order');
    return order;
  }

  async retrieveOrder(orderId: string): Promise<IOrder> {
    const response = await this.lalamoveClient.Order.retrieve('PH', orderId);
    if (!response) throw new ForbiddenException('Failed to Retrieve Order');
    return response;
  }

  async cancelOrder(orderId: string) {
    const response = await this.lalamoveClient.Order.cancel('PH', orderId);
    if (!response) throw new ForbiddenException('Failed to Cancel Order');
    return response;
  }
}

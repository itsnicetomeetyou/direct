import { DeliveryOptions, PaymentOptions } from '@prisma/client';

export class IOrderDocument {
  documentSelected: Array<string>;
  selectedSchedule: Date | null;
  deliveryOptions: DeliveryOptions;
  paymentOptions?: PaymentOptions;
  address?: string;
  additionalAddress?: string;
  longitude?: string | number;
  latitude?: string | number;
}

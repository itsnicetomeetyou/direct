import { DeliveryOptions } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class CheckQuotation {
  @IsEnum(DeliveryOptions)
  logisticType: DeliveryOptions;

  @IsNotEmpty()
  @IsLatitude()
  lat: string;

  @IsNotEmpty()
  @IsLongitude()
  lng: string;

  @IsNotEmpty()
  address: string;
}

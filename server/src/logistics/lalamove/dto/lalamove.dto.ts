import {
  IsString,
  IsLongitude,
  IsLatitude,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';

export class CreateQuotation {
  @IsNotEmpty()
  @IsLatitude()
  lat: string;

  @IsNotEmpty()
  @IsLongitude()
  lng: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

export class CreateOrder {
  @IsNotEmpty()
  @IsString()
  quotationId: string;

  @IsNotEmpty()
  @IsString()
  senderStopId: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('PH')
  senderPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  senderName: string;

  @IsNotEmpty()
  @IsString()
  recipientStopId: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('PH')
  recipientPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @IsOptional()
  @IsString()
  recipientRemarks: string;
}

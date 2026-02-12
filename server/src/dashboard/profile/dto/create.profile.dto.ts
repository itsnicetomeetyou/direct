import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import * as sanitizeHtml from 'sanitize-html';
import { Transform } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  firstName: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  middleName: string | null;

  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  lastName: string | null;

  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  studentNo: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  specialOrder: string | null;

  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  lrn: string | null;

  @IsPhoneNumber('PH')
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  phoneNo: string | null;

  @IsString()
  @Transform(({ value }) => (value ? sanitizeHtml(value) : value))
  address: string | null;
}

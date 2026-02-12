import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  /**
   * The OTP code to verify.
   */
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'OTP must be a 4-digit number' })
  otp: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

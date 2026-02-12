import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  /**
   * The email of the user.
   * Must be a valid email address.
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

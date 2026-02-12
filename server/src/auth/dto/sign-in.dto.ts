import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * Data Transfer Object for user sign-in.
 */
export class SignInDto {
  /**
   * The email of the user.
   * Must be a valid email address.
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * The password of the user.
   * Must be at least 8 characters long, contain at least one uppercase letter,
   * one lowercase letter, one number, and one special character.
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password too weak',
    },
  )
  password: string;
}

import {
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { Users } from '@prisma/client';
import { SignInDto } from './dto/sign-in.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../src/mail/mail.service';
import * as OTPAuth from 'otpauth';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserAuth } from '../../typings';

const totp = new OTPAuth.TOTP({
  issuer: 'ACME',
  label: 'Kuma Technologies',
  algorithm: 'SHA1',
  digits: 4,
  period: 30,
  secret: 'NB2W45DFOIZA',
});

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Registers a new user.
   *
   * @param {SignUpDto} data - The data transfer object containing user sign-up information.
   * @returns {Promise<Users | ExceptionFilter>} The created user object or exception throw.
   * @throws {ConflictException} If a user with the given email already exists.
   */
  async signUp(data: SignUpDto): Promise<Users | ExceptionFilter> {
    // Check if a user with the given email already exists
    const checkExists = await this.prismaService.users.findUnique({
      where: { email: data.email },
    });
    // If user exists, throw a conflict exception
    if (checkExists) throw new ConflictException('User Already Exists');
    // Hash the user's password
    const hashPassword = await hash(data.password, 12);
    // Create and return the new user
    return this.prismaService.users.create({
      data: { ...data, password: hashPassword },
    });
  }

  async signIn(data: SignInDto) {
    const user = await this.prismaService.users.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new NotFoundException('User Not Found');
    const decryptPass = await compare(data.password, user.password);
    if (!decryptPass)
      throw new UnauthorizedException('Invalid User Credentials');
    const payload = { sub: user.id, email: user.email, role: user.role };
    if (!user.emailVerified) {
      return {
        accessToken: await this.jwtService.signAsync(payload),
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      };
    }

    return {
      accessToken: await this.jwtService.signAsync(payload),
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  async verifyEmail(data: VerifyEmailDto) {
    const checkEmail = await this.prismaService.users.findFirst({
      where: {
        email: data.email,
      },
    });
    if (!checkEmail) throw new NotFoundException('User Not Found');
    if (checkEmail.emailVerified) throw new ConflictException('Email Verified');

    const otpCode = totp.generate();
    const encryptedOtp = await hash(otpCode, 12);
    const encryptedToJwt = await this.jwtService.signAsync({
      otp: encryptedOtp,
      email: checkEmail.email,
      sub: checkEmail.id,
    });
    await this.mailService.sendEmail({
      to: data.email,
      subject: 'OTP Verification',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f3f4f6; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #3b82f6; text-align: center; font-size: 24px; font-weight: 600;">OTP Verification</h2>
            <p style="font-size: 16px; color: #374151; margin-top: 16px;">Dear User,</p>
            <p style="font-size: 16px; color: #374151; margin-top: 8px;">Thank you for registering with us. Please use the following OTP code to complete your verification:</p>
            <div style="font-size: 24px; font-weight: bold; color: #1f2937; text-align: center; margin: 20px 0; padding: 10px; border: 1px dashed #3b82f6; border-radius: 8px;">
              ${otpCode}
            </div>
            <p style="font-size: 16px; color: #374151; margin-top: 8px;">This OTP code is valid for the next 10 minutes. Please do not share this code with anyone.</p>
            <p style="font-size: 16px; color: #374151; margin-top: 8px;">If you did not request this code, please disregard this email or contact us.</p>
            <p style="font-size: 16px; color: #374151; margin-top: 16px;">Best regards,</p>
            <p style="font-size: 16px; color: #374151; margin-top: 4px;">Kuma Technologies</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280; text-align: center;">Your privacy is important to us. For more information, please read our <a href="https://yourcompany.com/privacy-policy" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a>.</p>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">If you did not request this email, please disregard it or <a href="mailto:kumatechnologiesinc@gmail.com" style="color: #3b82f6; text-decoration: none;">contact us</a>.</p>
          </div>
        </div>
    `,
    });
    throw new HttpException(
      {
        statusCode: HttpStatus.OK,
        message: 'OTP Sent',
        data: encryptedToJwt,
      },
      HttpStatus.OK,
    );
  }

  async verifyOTP(data: VerifyOtpDto) {
    const jwtPayload = await this.jwtService.verifyAsync(data.token);
    if (!jwtPayload) throw new UnauthorizedException('Invalid Token');
    const user = await this.prismaService.users.findUnique({
      where: { id: jwtPayload.sub },
    });
    if (!user) throw new NotFoundException('User Not Found');
    if (user.emailVerified)
      throw new ConflictException('Email Already Verified');

    const decryptOtp = await compare(data.otp, jwtPayload.otp);
    if (!decryptOtp) throw new UnauthorizedException('Invalid OTP');
    await this.prismaService.users.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    throw new HttpException(
      {
        statusCode: HttpStatus.OK,
        message: 'Email Verified',
      },
      HttpStatus.OK,
    );
  }

  async session(user: UserAuth) {
    const checkExists = await this.prismaService.users.findFirst({
      where: { id: user.sub },
      select: {
        id: true,
        emailVerified: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        UserInformation: true,
      },
    });
    return checkExists;
  }
}

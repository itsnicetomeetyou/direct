import {
  Body,
  Controller,
  ExceptionFilter,
  Get,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { Role, Users } from '@prisma/client';
import { SignInDto } from './dto/sign-in.dto';
import { Roles } from '../../src/roles/roles.decorator';
import { RolesGuard } from '../../src/roles/roles.guard';
import { Public } from './auth.decorator';
import { UserAuth } from '../../typings';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user sign-up requests.
   *
   * @param {SignUpDto} data - The data transfer object containing user sign-up information.
   * @returns {Promise<Users | ExceptionFilter>} The created user object or exception throw.
   */
  @Public()
  @Post('sign-up')
  signUp(@Body() data: SignUpDto): Promise<Users | ExceptionFilter> {
    return this.authService.signUp(data);
  }

  @Public()
  @Post('sign-in')
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Query() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @Public()
  @Post('verify-otp')
  verifyOTP(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOTP(data);
  }

  @Get('session')
  authenticated(@Req() { user }: { user: UserAuth }) {
    return this.authService.session(user);
  }
}

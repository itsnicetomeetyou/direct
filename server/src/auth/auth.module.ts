import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './../constant/jwt.constant';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../src/roles/roles.guard';
import { AuthGuard } from './auth.guard';
import { MailService } from '../../src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    MailService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

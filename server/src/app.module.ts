import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ProfileModule } from './dashboard/profile/profile.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { DocumentModule } from './dashboard/document/document.module';
import { LalamoveService } from './logistics/lalamove/lalamove.service';
import { ConfigModule } from '@nestjs/config';
import { NinjavanService } from './logistics/ninjavan/ninjavan.service';
import { TrackingModule } from './dashboard/tracking/tracking.module';
import { StatisticsModule } from './dashboard/statistics/statistics.module';
import { ScheduleService } from './schedule/schedule.service';
import { ScheduleModule } from './schedule/schedule.module';
import { XenditService } from './xendit/xendit.service';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.APP_SMTP_HOST,
        port: Number(process.env.APP_SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.APP_SMTP_EMAIL,
          pass: process.env.APP_SMTP_PASS,
        },
      },
      defaults: {
        from: `"${process.env.APP_SMTP_NAME || 'DiReCT'}" <${process.env.APP_SMTP_EMAIL}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    DocumentModule,
    ConfigModule,
    TrackingModule,
    StatisticsModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    LalamoveService,
    NinjavanService,
    ScheduleService,
    XenditService,
  ],
})
export class AppModule {}

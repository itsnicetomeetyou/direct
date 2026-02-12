import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { MailService } from '../../../src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { LalamoveService } from '../../../src/logistics/lalamove/lalamove.service';
import { ScheduleService } from '../../../src/schedule/schedule.service';
import { XenditService } from '../../xendit/xendit.service';

@Module({
  imports: [DocumentModule],
  providers: [
    DocumentService,
    PrismaService,
    MailService,
    ConfigService,
    LalamoveService,
    ScheduleService,
    XenditService,
  ],
  controllers: [DocumentController],
})
export class DocumentModule {}

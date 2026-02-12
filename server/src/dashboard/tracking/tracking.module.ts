import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { LalamoveService } from '../../../src/logistics/lalamove/lalamove.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService, PrismaService, LalamoveService, ConfigService],
})
export class TrackingModule {}

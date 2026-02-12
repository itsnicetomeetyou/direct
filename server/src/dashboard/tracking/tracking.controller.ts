import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { UserAuth } from '../../../typings';
import { Roles } from '../../../src/roles/roles.decorator';
import { DeliveryOptions, Role } from '@prisma/client';
import { RolesGuard } from '../../../src/roles/roles.guard';

@Controller('dashboard/tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('/:id')
  findOneTrackingOrder(
    @Param('id') id: string,
    @Query('logistic') logistic: DeliveryOptions,
    @Req() { user }: { user: UserAuth },
  ) {
    return this.trackingService.findOneTrackingOrder(id, logistic, user);
  }
}

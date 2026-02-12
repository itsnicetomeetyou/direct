import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../../src/roles/roles.decorator';
import { RolesGuard } from '../../../src/roles/roles.guard';
import { UserAuth } from '../../../typings';
import { StatisticsService } from './statistics.service';

@Controller('dashboard/statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get()
  async findStatus(@Req() { user }: { user: UserAuth }) {
    return {
      status: await this.statisticsService.findStatus(user),
      transaction: await this.statisticsService.findManyTransaction(user),
    };
  }
}

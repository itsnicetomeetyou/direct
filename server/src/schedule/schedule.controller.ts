import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../src/auth/auth.decorator';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Public()
  @Get()
  checkAllSchedulePerDate() {
    return this.scheduleService.checkAllSchedulePerDate();
  }

  @Public()
  @Get('check')
  checkScheduleForDate(@Query('date') date: string) {
    return this.scheduleService.checkScheduleForDate(date);
  }
}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserAuth } from '../../../typings';
import { Roles } from '../../../src/roles/roles.decorator';
import { RolesGuard } from '../../../src/roles/roles.guard';
import { CreateProfileDto } from './dto/create.profile.dto';

@Controller('dashboard/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Roles('STUDENT')
  @UseGuards(RolesGuard)
  @Get()
  findOne(@Req() { user }: { user: UserAuth }) {
    return this.profileService.findOne(user);
  }

  @Roles('STUDENT')
  @UseGuards(RolesGuard)
  @Post()
  create(@Req() { user }: { user: UserAuth }, @Body() data: CreateProfileDto) {
    return this.profileService.upsertUserInformation(user, data);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { UserAuth } from '../../../typings';
import { CreateProfileDto } from './dto/create.profile.dto';
import { UserInformation } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @param {UserAuth} user - The authenticated user object containing user ID.
   */
  async findOne(user: UserAuth) {
    return await this.prismaService.users.findFirst({
      where: {
        id: user.sub,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        UserInformation: true,
      },
    });
  }

  /**
   * Updates or creates user information.
   *
   * @param {UserAuth} user - The authenticated user object containing user ID.
   * @param {CreateProfileDto} data - The data transfer object containing user profile information.
   * @returns {Promise<UserInformation>} The updated or created user information object.
   */
  async upsertUserInformation(
    user: UserAuth,
    data: CreateProfileDto,
  ): Promise<UserInformation> {
    const updateUserInformation =
      await this.prismaService.userInformation.upsert({
        where: {
          userId: user.sub,
        },
        update: { ...data },
        create: { ...data, userId: user.sub },
      });
    return updateUserInformation;
  }
}

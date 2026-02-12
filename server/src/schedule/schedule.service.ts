import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Checks all schedules per date where selectedSchedule is not null and status is one of the specified values.
   * Groups the results by date (ignoring the time) and transforms the output.
   *
   * @returns {Promise<Array<{count: string;date: string;disabled: boolean;}>>} The list of request documents grouped by date.
   * Each item in the list contains the count of schedules, the date, and a disabled flag.
   * The disabled flag is set to true if the count of schedules for that date is greater than 300.
   */
  async checkAllSchedulePerDate(): Promise<
    Array<{
      count: string;
      date: string;
      disabled: boolean;
    }>
  > {
    // Limit the number of schedules per date
    const limitPerDate = 300;
    // Group request documents by selectedSchedule date and count the number of schedules for each date
    const result = await this.prismaService.requestDocuments.groupBy({
      by: ['selectedSchedule'],
      where: {
        selectedSchedule: {
          not: null,
        },
        OR: [
          { status: 'PENDING' },
          { status: 'PAID' },
          { status: 'PROCESSING' },
          { status: 'READYTOPICKUP' },
        ],
      },
      _count: {
        selectedSchedule: true,
      },
    });

    // Transform the result to the desired format
    const transformedResult = result.map((item) => ({
      count: item._count.selectedSchedule.toString(),
      date: item.selectedSchedule
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/'),
      disabled: item._count.selectedSchedule > limitPerDate,
    }));

    return transformedResult;
  }

  /**
   * Checks the schedules for a specific date where selectedSchedule is not null and status is one of the specified values.
   * Transforms the output to include the count of schedules, the date, and a disabled flag.
   *
   * @param {string} date - The date to check schedules for (in YYYY-MM-DD format).
   * @returns {Promise<{count: string; date: string; disabled: boolean;}>} The request documents for the specified date.
   * The output contains the count of schedules, the date, and a disabled flag.
   * The disabled flag is set to true if the count of schedules for that date is greater than 300.
   * @throws {NotFoundException} If no schedules are found for the specified date.
   * @throws {BadRequestException} If the input date is not in the correct format.
   */
  async checkScheduleForDate(date: string): Promise<{
    count: string;
    date: string;
    disabled: boolean;
  }> {
    // Limit the number of schedules per date
    const limitPerDate = 300;
    // Validate the input date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException(
        'Invalid date format. Please use YYYY-MM-DD.',
      );
    }
    // Parse the input date to a Date object
    const parsedDate = new Date(date);

    // Find request documents for the specified date
    const result = await this.prismaService.requestDocuments.groupBy({
      by: ['selectedSchedule'],
      where: {
        selectedSchedule: {
          equals: parsedDate,
        },
        OR: [
          { status: 'PENDING' },
          { status: 'PAID' },
          { status: 'PROCESSING' },
          { status: 'READYTOPICKUP' },
        ],
      },
      _count: {
        selectedSchedule: true,
      },
    });

    if (result.length === 0) {
      return {
        count: '0',
        date: date,
        disabled: false,
      };
    }

    // Transform the result to the desired format
    const item = result[0];
    const transformedResult = {
      count: item._count.selectedSchedule.toString(),
      date: item.selectedSchedule
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/'),
      disabled: item._count.selectedSchedule > limitPerDate,
    };

    return transformedResult;
  }
}

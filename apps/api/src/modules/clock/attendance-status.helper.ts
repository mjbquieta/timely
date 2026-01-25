import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Holiday } from '@prisma/client';
import { HolidayService } from '../holiday/holiday.service';
import { RestDayService } from '../rest-day/rest-day.service';

export interface AttendanceStatusResult {
  isHoliday: boolean;
  isRestDay: boolean;
  holiday?: Holiday;
}

@Injectable()
export class AttendanceStatusHelper {
  constructor(
    private readonly holidayService: HolidayService,
    private readonly restDayService: RestDayService,
  ) {}

  async getStatusForDate(
    userId: UUID,
    branchId: UUID,
    date: string,
  ): Promise<AttendanceStatusResult> {
    // Check holiday first (priority over rest day)
    const holiday = await this.holidayService.isHoliday(branchId, date);

    if (holiday) {
      return {
        isHoliday: true,
        isRestDay: false,
        holiday,
      };
    }

    // Check rest day
    const isRestDay = await this.restDayService.isRestDay(userId, date);

    return {
      isHoliday: false,
      isRestDay,
    };
  }
}

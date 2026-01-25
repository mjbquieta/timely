import { Module } from '@nestjs/common';
import { ClockService } from './clock.service';
import { ClockController } from './clock.controller';
import { BranchModule } from '../branch/branch.module';
import { UserModule } from '../user/user.module';
import { ShiftModule } from '../shift/shift.module';
import { HolidayModule } from '../holiday/holiday.module';
import { RestDayModule } from '../rest-day/rest-day.module';
import { AttendanceStatusHelper } from './attendance-status.helper';

@Module({
  imports: [BranchModule, UserModule, ShiftModule, HolidayModule, RestDayModule],
  providers: [ClockService, AttendanceStatusHelper],
  controllers: [ClockController],
  exports: [ClockService, AttendanceStatusHelper],
})
export class ClockModule {}

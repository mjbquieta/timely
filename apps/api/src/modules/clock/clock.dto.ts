import { DeviceMode } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

class DeviceTimeDto {
  @IsString()
  @IsOptional()
  remark?: string;

  @IsEnum(DeviceMode)
  deviceMode: DeviceMode = DeviceMode.UI_MGLOG_HAND_OPEN;

  @IsBoolean()
  isTimeIn: boolean = true;
}

export { DeviceTimeDto };
// import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
// import { IsBranchIdExist } from '../branch/branch-id.exist.validator';
// import { UUID } from 'crypto';
// import { IsAttendeeIdExist } from '../attendee/attendee-id.exist.validator';

// enum LeaveType {
//   SICK = 'SICK',
//   VACATION = 'VACATION',
// }

// class ClockDto {
//   @IsUUID(4)
//   @IsBranchIdExist()
//   branchId: UUID;

//   @IsUUID(4)
//   @IsAttendeeIdExist()
//   attendeeId: UUID;
// }

// class FileLeaveDto {
//   @IsEnum(LeaveType)
//   leaveType: LeaveType;

//   @IsString()
//   @IsOptional()
//   remarks?: string;
// }

// export { LeaveType, ClockDto, FileLeaveDto };

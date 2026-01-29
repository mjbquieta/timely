import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  Matches,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { LeaveType, HalfDayType, TimeRequestType, TimeRequestStatus } from '@prisma/client';
import { UUID } from 'crypto';
import { IsTimeRequestIdExist } from './validators/time-request-id.exist.validator';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class TimeRequestIdDto {
  @IsTimeRequestIdExist()
  @IsUUID(4)
  requestId: UUID;
}

// Leave Request DTOs
export class CreateLeaveRequestDto {
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @Matches(DATE_REGEX, { message: 'startDate must be in yyyy-MM-dd format' })
  startDate: string;

  @Matches(DATE_REGEX, { message: 'endDate must be in yyyy-MM-dd format' })
  endDate: string;

  @IsEnum(HalfDayType)
  @IsOptional()
  halfDayType?: HalfDayType;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

// Overtime Request DTOs
export class CreateOvertimeRequestDto {
  @Matches(DATE_REGEX, { message: 'otDate must be in yyyy-MM-dd format' })
  otDate: string;

  @Matches(TIME_REGEX, { message: 'otStartTime must be in HH:mm format' })
  otStartTime: string;

  @Matches(TIME_REGEX, { message: 'otEndTime must be in HH:mm format' })
  otEndTime: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

// Undertime Request DTOs
export class CreateUndertimeRequestDto {
  @Matches(DATE_REGEX, { message: 'utDate must be in yyyy-MM-dd format' })
  utDate: string;

  @Matches(TIME_REGEX, { message: 'utStartTime must be in HH:mm format' })
  utStartTime: string;

  @Matches(TIME_REGEX, { message: 'utEndTime must be in HH:mm format' })
  utEndTime: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

// Approval/Rejection DTOs
export class ReviewTimeRequestDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}

// Query DTOs
export class TimeRequestQueryDto {
  @IsEnum(TimeRequestType)
  @IsOptional()
  type?: TimeRequestType;

  @IsEnum(TimeRequestStatus)
  @IsOptional()
  status?: TimeRequestStatus;

  @Matches(DATE_REGEX, { message: 'startDate must be in yyyy-MM-dd format' })
  @IsOptional()
  startDate?: string;

  @Matches(DATE_REGEX, { message: 'endDate must be in yyyy-MM-dd format' })
  @IsOptional()
  endDate?: string;
}

export class PendingRequestsQueryDto {
  @IsUUID(4)
  @IsOptional()
  userId?: UUID;

  @IsEnum(TimeRequestType)
  @IsOptional()
  type?: TimeRequestType;
}

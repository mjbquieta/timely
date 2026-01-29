import {
  IsEnum,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { LeaveType } from '@prisma/client';
import { UUID } from 'crypto';

export class CreateLeaveBalanceDto {
  @IsUUID(4)
  userId: UUID;

  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(0)
  totalAllowance: number;
}

export class UpdateLeaveBalanceDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAllowance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usedDays?: number;
}

export class LeaveBalanceQueryDto {
  @IsUUID(4)
  @IsOptional()
  userId?: UUID;

  @IsInt()
  @IsOptional()
  year?: number;
}

export class UserLeaveBalanceParamsDto {
  @IsUUID(4)
  userId: UUID;
}

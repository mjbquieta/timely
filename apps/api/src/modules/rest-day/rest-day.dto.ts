import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsInt,
  IsDateString,
  ValidateIf,
  Min,
  Max,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { RestDayScheduleType } from '@prisma/client';
import { UUID } from 'crypto';
import { PartialType } from '@nestjs/mapped-types';
import { IsRestDayRuleIdExist } from './validators/rest-day-id.exist.validator';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class RestDayRuleIdDto {
  @IsRestDayRuleIdExist()
  @IsUUID(4)
  ruleId: UUID;
}

export class CreateRestDayRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(RestDayScheduleType)
  scheduleType: RestDayScheduleType;

  // For FIXED_WEEKLY: array of day numbers (0=Sunday, 6=Saturday)
  @ValidateIf((o) => o.scheduleType === RestDayScheduleType.FIXED_WEEKLY)
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  fixedDays?: number[];

  // For ROTATING: work days count
  @ValidateIf((o) => o.scheduleType === RestDayScheduleType.ROTATING)
  @IsInt()
  @Min(1)
  workDays?: number;

  // For ROTATING: rest days count
  @ValidateIf((o) => o.scheduleType === RestDayScheduleType.ROTATING)
  @IsInt()
  @Min(1)
  restDays?: number;

  // For ROTATING: pattern start date
  @ValidateIf((o) => o.scheduleType === RestDayScheduleType.ROTATING)
  @Matches(DATE_REGEX, {
    message: 'patternStartDate must be in yyyy-MM-dd format',
  })
  patternStartDate?: string;

  // Scope - at least one must be provided
  @IsUUID(4)
  @IsOptional()
  branchId?: UUID;

  @IsUUID(4)
  @IsOptional()
  departmentId?: UUID;

  @IsUUID(4)
  @IsOptional()
  userId?: UUID;

  @IsDateString()
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}

export class UpdateRestDayRuleDto extends PartialType(CreateRestDayRuleDto) {}

export class CheckRestDayDto {
  @IsUUID(4)
  userId: UUID;

  @Matches(DATE_REGEX, { message: 'date must be in yyyy-MM-dd format' })
  date: string;
}

export class UserRestDayQueryDto {
  @IsUUID(4)
  userId: UUID;
}

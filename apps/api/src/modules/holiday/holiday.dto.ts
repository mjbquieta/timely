import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';
import { HolidayType } from '@prisma/client';
import { UUID } from 'crypto';
import { PartialType } from '@nestjs/mapped-types';
import { IsHolidayIdExist } from './validators/holiday-id.exist.validator';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class HolidayIdDto {
  @IsHolidayIdExist()
  @IsUUID(4)
  holidayId: UUID;
}

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(HolidayType)
  type: HolidayType;

  @Matches(DATE_REGEX, { message: 'startDate must be in yyyy-MM-dd format' })
  startDate: string;

  @Matches(DATE_REGEX, { message: 'endDate must be in yyyy-MM-dd format' })
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {}

export class CheckHolidayDto {
  @Matches(DATE_REGEX, { message: 'date must be in yyyy-MM-dd format' })
  date: string;
}

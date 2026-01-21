import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { IsTimeRangeValid } from './time-range.validator';
import { IsShiftIdExist } from './shift-id.exist.validator';
import { UUID } from 'crypto';
import { PartialType } from '@nestjs/mapped-types';
import { IsDepartmentIdExist } from '../department/department-id.exist.validator';

const TIME_CODE_REGEX = /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

class ShiftIdDto {
  @IsString()
  @IsShiftIdExist()
  @IsUUID(4)
  shiftId: UUID;
}

class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault: boolean = false;

  @Matches(TIME_CODE_REGEX, {
    message: 'startTime must be in HH:MM:SS format (e.g., 09:30:00)',
  })
  @IsTimeRangeValid('endTime', {
    message: 'startTime must be earlier than endTime and not equal',
  })
  startTime: string;

  @Matches(TIME_CODE_REGEX, {
    message: 'endTime must be in HH:MM:SS format (e.g., 17:30:00)',
  })
  @IsTimeRangeValid('startTime', {
    message: 'endTime must be later than startTime and not equal',
  })
  endTime: string;
}

class CreateShiftPartialDto extends PartialType(CreateShiftDto) {}

class TagToDepartmentDto extends ShiftIdDto {
  @IsDepartmentIdExist()
  @IsUUID(4)
  departmentId: UUID;
}

export {
  CreateShiftDto,
  ShiftIdDto,
  CreateShiftPartialDto,
  TagToDepartmentDto,
};

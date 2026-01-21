import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UUID } from 'crypto';
import { IsBranchIdExist } from './validators/branch-id.exist.validator';
import { IsDeviceSnExist } from './validators/device.exist.validator';
import { PasswordDto } from '../auth/auth.dto';

@ValidatorConstraint({ name: 'BothDatesProvided', async: false })
class BothDatesProvidedConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const { startDate, endDate } = args.object as any;

    if (!startDate && !endDate) return true; // both optional — OK
    if (startDate && endDate) return true; // both provided — OK
    return false; // one is missing — invalid
  }

  defaultMessage(_: ValidationArguments) {
    return 'Both startDate and endDate must be provided together';
  }
}

class QueryAttendanceDto {
  @IsUUID(4)
  @IsOptional()
  attendeeId?: UUID;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Validate(BothDatesProvidedConstraint)
  private readonly _datesGroupValidator?: any;
}

class BranchIdDto {
  @IsBranchIdExist()
  @IsUUID(4)
  branchId: UUID;
}

class CreateBranchUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address1?: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  deviceSerialNumber?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

class DeviceSnDto {
  @IsString()
  sn: string;
}

class PartialBranchUserDto extends PartialType(CreateBranchUserDto) {}

class BranchChangePasswordDto extends PasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export {
  BranchChangePasswordDto,
  DeviceSnDto,
  BranchIdDto,
  CreateBranchUserDto,
  PartialBranchUserDto,
  QueryAttendanceDto,
};

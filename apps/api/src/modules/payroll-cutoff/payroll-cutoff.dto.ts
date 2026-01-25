import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  Matches,
} from 'class-validator';
import { UUID } from 'crypto';
import { PartialType } from '@nestjs/mapped-types';
import { IsPayrollCutoffIdExist } from './validators/cutoff-id.exist.validator';

const TIME_REGEX = /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export class PayrollCutoffIdDto {
  @IsPayrollCutoffIdExist()
  @IsUUID(4)
  cutoffId: UUID;
}

export class CreatePayrollCutoffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  periodStartDate: string;

  @Matches(TIME_REGEX, {
    message: 'periodStartTime must be in HH:mm:ss format',
  })
  periodStartTime: string;

  @IsDateString()
  periodEndDate: string;

  @Matches(TIME_REGEX, { message: 'periodEndTime must be in HH:mm:ss format' })
  periodEndTime: string;

  @IsDateString()
  @IsOptional()
  releaseDate?: string;
}

export class UpdatePayrollCutoffDto extends PartialType(
  CreatePayrollCutoffDto,
) {}

export class HrOverrideDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAttendeeUserWithPasswordDto, UserDto } from '../user/user.dto';
import { Type } from 'class-transformer';
import { UUID } from 'crypto';
import { IsCompanyOwnerIdExist } from '../user/validators/company-owner-id.exist.validator';
import { IsCompanyNameExist } from './validators/name.exist.validator';
import { PartialType } from '@nestjs/mapped-types';

class CompanyIdDto {
  @IsUUID(4)
  @IsNotEmpty()
  companyId: UUID;
}

class CompanyDto {
  @IsString()
  @IsNotEmpty()
  // @IsCompanyNameExist()
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
}

class CompanyPartialDto extends PartialType(CompanyDto) {}

class CreateCompanyDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CreateAttendeeUserWithPasswordDto)
  owner: CreateAttendeeUserWithPasswordDto;
}

class CreateCompanyWithExistingOwnerDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @IsCompanyOwnerIdExist()
  @IsUUID(4)
  ownerId: UUID;
}

export {
  CompanyDto,
  CompanyIdDto,
  CompanyPartialDto,
  CreateCompanyDto,
  CreateCompanyWithExistingOwnerDto,
};

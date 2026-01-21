import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  MinLength,
} from 'class-validator';
import { IsUserUsernameExist } from './validators/user-username-exist.validator';
import { IsUserEmailExist } from './validators/user-email-exist.validator';
import { PartialType } from '@nestjs/mapped-types';
import { UUID } from 'crypto';
import { IsUserIdExist } from './validators/user-id.exist.validator';
import { AttendanceStatus, UserType } from '@prisma/client';
import { Transform } from 'class-transformer';

class UserIdDto {
  @IsUserIdExist()
  @IsUUID(4)
  userId: UUID;
}

class UserNonWorkingDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus = AttendanceStatus.ABSENT;
}

class UserDto {
  @IsString()
  @IsNotEmpty()
  @IsUserUsernameExist()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsUserEmailExist()
  email: string;

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

class CreateAttendeeUserWithPasswordDto extends UserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

class PartialUserDto extends PartialType(UserDto) {}

class MakeUserAsDto extends UserIdDto {
  @IsEnum(UserType)
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  userType: UserType;
}

export {
  UserDto,
  CreateAttendeeUserWithPasswordDto,
  PartialUserDto,
  UserIdDto,
  UserNonWorkingDto,
  MakeUserAsDto,
};

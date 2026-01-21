import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBranchUserDto } from '../branch/branch.dto';
import { UserDto } from '../user/user.dto';
import { IsCompanyNameExist } from '../company/validators/name.exist.validator';

// Custom validator to ensure either username or email is provided
@ValidatorConstraint({ name: 'isUsernameOrEmailProvided', async: false })
export class IsUsernameOrEmailProvidedConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const username = object.username;
    const email = object.email;

    // At least one of username or email must be provided
    return !!(username || email);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either username or email must be provided';
  }
}

export function IsUsernameOrEmailProvided(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameOrEmailProvidedConstraint,
    });
  };
}

class PasswordDto {
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

class CreateAsBranchUserDto extends PasswordDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CreateBranchUserDto)
  branch: CreateBranchUserDto;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UserDto)
  user: UserDto;
}

class LoginDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsUsernameOrEmailProvided()
  loginIdentifier: string; // This field is used for validation only
}

class LoginAsCompanyWithCompanyNameDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;
}

export {
  CreateBranchUserDto,
  UserDto,
  CreateAsBranchUserDto,
  LoginDto,
  PasswordDto,
  LoginAsCompanyWithCompanyNameDto,
};

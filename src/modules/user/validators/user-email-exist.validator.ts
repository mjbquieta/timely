import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserService } from '../user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUserEmailExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UserService) {}

  async validate(email: string, args: ValidationArguments) {
    if (!email) {
      return false;
    }

    const exists = await this.userService.isEmailExist(email);
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return `Email ${args.value} already exists.`;
  }
}

export function IsUserEmailExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserEmailExistConstraint,
    });
  };
}

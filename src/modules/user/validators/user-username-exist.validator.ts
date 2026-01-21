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
export class IsUserUsernameExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UserService) {}

  async validate(username: string, args: ValidationArguments) {
    if (!username) {
      return false;
    }

    const exists = await this.userService.isUsernameExist(username);
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return `Username ${args.value} already exists.`;
  }
}

export function IsUserUsernameExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserUsernameExistConstraint,
    });
  };
}

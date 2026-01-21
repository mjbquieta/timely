import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UUID } from 'crypto';
import { UserService } from '../user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCompanyOwnerIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UserService) {}

  async validate(id: UUID, args: ValidationArguments) {
    return this.userService.isCompanyOwnerExist(id);
  }

  defaultMessage(args: ValidationArguments) {
    return `User ${args.value} not found.`;
  }
}

export function IsCompanyOwnerIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCompanyOwnerIdExistConstraint,
    });
  };
}

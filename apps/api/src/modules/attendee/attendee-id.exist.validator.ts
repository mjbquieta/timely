import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AttendeeService } from './attendee.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAttendeeIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly attendeeService: AttendeeService) {}

  async validate(id: UUID, args: ValidationArguments) {
    return this.attendeeService.isExist(id);
  }

  defaultMessage(args: ValidationArguments) {
    return `Branch ${args.value} not found.`;
  }
}

export function IsAttendeeIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAttendeeIdExistConstraint,
    });
  };
}

import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ShiftService } from './shift.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsShiftIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly shiftService: ShiftService) {}

  async validate(id: UUID, args: ValidationArguments) {
    return this.shiftService.isExist(id);
  }

  defaultMessage(args: ValidationArguments) {
    return `Shift ${args.value} not found.`;
  }
}

export function IsShiftIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsShiftIdExistConstraint,
    });
  };
}

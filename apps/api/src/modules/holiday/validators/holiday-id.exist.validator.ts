import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { HolidayService } from '../holiday.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsHolidayIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly holidayService: HolidayService) {}

  async validate(id: UUID, args: ValidationArguments): Promise<boolean> {
    return this.holidayService.isExist(id);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Holiday ${args.value} not found.`;
  }
}

export function IsHolidayIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsHolidayIdExistConstraint,
    });
  };
}

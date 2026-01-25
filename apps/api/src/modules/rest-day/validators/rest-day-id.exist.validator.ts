import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { RestDayService } from '../rest-day.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsRestDayRuleIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly restDayService: RestDayService) {}

  async validate(id: UUID, args: ValidationArguments): Promise<boolean> {
    return this.restDayService.isExist(id);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Rest day rule ${args.value} not found.`;
  }
}

export function IsRestDayRuleIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRestDayRuleIdExistConstraint,
    });
  };
}

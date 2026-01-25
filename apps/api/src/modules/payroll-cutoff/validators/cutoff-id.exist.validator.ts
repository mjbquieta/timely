import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PayrollCutoffService } from '../payroll-cutoff.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPayrollCutoffIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly payrollCutoffService: PayrollCutoffService) {}

  async validate(id: UUID, args: ValidationArguments): Promise<boolean> {
    return this.payrollCutoffService.isExist(id);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Payroll cutoff ${args.value} not found.`;
  }
}

export function IsPayrollCutoffIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPayrollCutoffIdExistConstraint,
    });
  };
}

import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { DepartmentService } from './department.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsDepartmentIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly departmentService: DepartmentService) {}

  async validate(id: UUID, args: ValidationArguments) {
    return this.departmentService.isExist(id);
  }

  defaultMessage(args: ValidationArguments) {
    return `Department ${args.value} not found.`;
  }
}

export function IsDepartmentIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDepartmentIdExistConstraint,
    });
  };
}

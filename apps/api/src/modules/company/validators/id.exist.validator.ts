import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CompanyService } from '../company.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCompanyIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly companyService: CompanyService) {}

  async validate(companyId: UUID, args: ValidationArguments) {
    const exists = await this.companyService.isCompanyIdExist(companyId);
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return `Company ${args.value} not found.`;
  }
}

export function IsCompanyIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCompanyIdExistConstraint,
    });
  };
}

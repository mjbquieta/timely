import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CompanyService } from '../company.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCompanyNameExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly companyService: CompanyService) {}

  async validate(name: string, args: ValidationArguments) {
    const exists = await this.companyService.isNameExist(name);
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return `Company name ${args.value} already exists.`;
  }
}

export function IsCompanyNameExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCompanyNameExistConstraint,
    });
  };
}

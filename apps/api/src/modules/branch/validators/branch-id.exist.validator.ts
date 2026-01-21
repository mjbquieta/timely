import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BranchService } from '../branch.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsBranchIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly branchService: BranchService) {}

  async validate(id: UUID, args: ValidationArguments) {
    return this.branchService.isExist(id);
  }

  defaultMessage(args: ValidationArguments) {
    return `Branch ${args.value} not found.`;
  }
}

export function IsBranchIdExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBranchIdExistConstraint,
    });
  };
}

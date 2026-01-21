import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BranchService } from '../branch.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsDeviceSnExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly branchService: BranchService) {}

  async validate(sn: string, args: ValidationArguments) {
    const branch = await this.branchService.getBranchByDeviceSerialNumber(sn);
    return Boolean(branch);
  }

  defaultMessage(args: ValidationArguments) {
    return `Device ${args.value} not found.`;
  }
}

export function IsDeviceSnExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDeviceSnExistConstraint,
    });
  };
}

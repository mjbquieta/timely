import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { TimeRequestService } from '../time-request.service';
import { UUID } from 'crypto';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsTimeRequestIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly timeRequestService: TimeRequestService) {}

  async validate(id: UUID, args: ValidationArguments): Promise<boolean> {
    return this.timeRequestService.isExist(id);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Time request ${args.value} not found.`;
  }
}

export function IsTimeRequestIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeRequestIdExistConstraint,
    });
  };
}

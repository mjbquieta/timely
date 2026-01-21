// validators/is-time-range-valid.validator.ts
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function toSeconds(time: string): number {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

export function IsTimeRangeValid(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTimeRangeValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) return true;

          const thisSecs = toSeconds(value);
          const otherSecs = toSeconds(relatedValue);

          // must not be equal
          if (thisSecs === otherSecs) return false;

          // Always enforce start < end
          if (propertyName === 'startTime') {
            return thisSecs < otherSecs;
          }
          if (propertyName === 'endTime') {
            return otherSecs < thisSecs;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          if ((args.object as any)[relatedPropertyName] === args.value) {
            return `${args.property} should not be equal to ${relatedPropertyName}`;
          }
          return `${args.property} must be later than ${relatedPropertyName} and not equal`;
        },
      },
    });
  };
}

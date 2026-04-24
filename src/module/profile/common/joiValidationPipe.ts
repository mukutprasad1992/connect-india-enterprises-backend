import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import Joi from 'joi';

import {
  invalidMobileNumber,
  mustBeAValidEmail,
  pleaseProvideAValidEmailAddress,
  failsToMatchTheRequiredPattern,
  inputCannotBeUndefinedOrNull,
} from './profileMessage';

@Injectable()
export class ValidationUser implements PipeTransform {
  constructor(private readonly schema: Joi.ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      throw new BadRequestException({
        statusCode: 400,
        message: inputCannotBeUndefinedOrNull,
      });
    }

    const { error } = this.schema.validate(value, { abortEarly: true });
    if (error) {
      let errorMessage = error.details[0].message;
      if (
        errorMessage.includes(failsToMatchTheRequiredPattern) &&
        errorMessage.includes('mobileNo')
      ) {
        errorMessage = invalidMobileNumber;
      }
      if (errorMessage.includes(mustBeAValidEmail)) {
        errorMessage = pleaseProvideAValidEmailAddress;
      }
      errorMessage = errorMessage.replace(/"([^"]*)"/g, '$1');
      errorMessage =
        errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

      throw new BadRequestException({
        statusCode: 400,
        errors: errorMessage,
      });
    }

    return value;
  }
}

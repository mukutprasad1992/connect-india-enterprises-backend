import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import Joi from 'joi';
import {
  inputCannotBeUndefinedOrNull,
  invalidMobileNumber,
  pleaseProvideAValidEmailAddress,
  failsToMatchTheRequiredPattern,
  mustBeAValidEmail,
  passwordMustBeAtLeast6CharactersLong,
} from './userMessage';

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

    const { error } = this.schema.validate(value);
    if (error) {
      let errorMessage = error.details[0].message;
      if (errorMessage.includes(failsToMatchTheRequiredPattern)) {
        if (errorMessage.includes('mobileNo')) {
          errorMessage = invalidMobileNumber;
        }
      }
      if (errorMessage.includes(mustBeAValidEmail)) {
        errorMessage = pleaseProvideAValidEmailAddress;
      }
      if (errorMessage.includes('password')) {
        errorMessage = passwordMustBeAtLeast6CharactersLong;
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

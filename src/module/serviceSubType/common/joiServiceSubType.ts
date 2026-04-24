import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import Joi from 'joi';
import {
  inputCannotBeUndefinedOrNull,
  ServiceSubTypeIsRequired,
  failsToMatchTheRequiredPattern,
} from './serviceSubTypeMessage';

@Injectable()
export class ValidationServiceSubType implements PipeTransform {
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
        if (errorMessage.includes('ledgerType')) {
          errorMessage = ServiceSubTypeIsRequired;
        }
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

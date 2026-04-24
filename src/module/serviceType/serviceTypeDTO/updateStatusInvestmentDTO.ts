import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';
import {
  atLeastOneFieldMustBeProvidedForpdate,
  statusMustBeOneOf,
} from '../common/serviceTypeMessage';

@Injectable()
export class UpdateStatusServiceTypeDTO {
  [key: string]: any;

  static getValidationSchema() {
    const baseSchema = {
      status: Joi.string()
        .valid(...Object.values(ServiceTypeStatus))
        .messages({
          'any.only': `${statusMustBeOneOf}: ${Object.values(ServiceTypeStatus).join(', ')}`,
        }),
    };
    return Joi.object(baseSchema).unknown(true).min(1).messages({
      'object.min': atLeastOneFieldMustBeProvidedForpdate,
    });
  }

  static validate(data: any) {
    const schema = this.getValidationSchema();
    return schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });
  }
}

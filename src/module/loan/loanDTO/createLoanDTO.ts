import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { LoanStatus } from '../loanEntity/loanEntity';
import {
  aadharNumberIsRequired,
  aadharNumberMustBe12Or16Digits,
  activeStepsIsRequired,
  activeStepsMustPersonalDetails,
  currentAddressNameIsRequired,
  maritalStatusNameIsRequired,
  motherNameIsRequired,
  panNumberIsRequired,
  PANnumberMustFollowFormat5Letters4Digits1Letter,
  serviceIdIsRequired,
  serviceIdMustAbeNumber,
  serviceSubTypeIsRequired,
  serviceSubTypeMustBeAString,
  statusMustBeOneOf,
} from '../common/loanMessage';

@Injectable()
export class CreateLoanDTO {
  [key: string]: any;

  static getValidationSchema() {
    return Joi.object({
      serviceId: Joi.number().integer().positive().required().messages({
        'any.required': serviceIdIsRequired,
        'number.base': serviceIdMustAbeNumber,
      }),

      serviceSubType: Joi.string().trim().required().messages({
        'any.required': serviceSubTypeIsRequired,
        'string.base': serviceSubTypeMustBeAString,
      }),

      aadharNumber: Joi.string()
        .pattern(/^(?:\d{12}|\d{16})$/)
        .required()
        .messages({
          'string.pattern.base': aadharNumberMustBe12Or16Digits,
          'any.required': aadharNumberIsRequired,
        }),

      panNumber: Joi.string()
        .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)
        .required()
        .messages({
          'string.pattern.base':
            PANnumberMustFollowFormat5Letters4Digits1Letter,
          'any.required': panNumberIsRequired,
        }),
      motherName: Joi.string().required().messages({
        'any.required': motherNameIsRequired,
      }),
      maritalStatus: Joi.string().required().messages({
        'any.required': maritalStatusNameIsRequired,
      }),
      currentAddress: Joi.string().required().messages({
        'any.required': currentAddressNameIsRequired,
      }),

      status: Joi.string()
        .valid(...Object.values(LoanStatus))
        .default(LoanStatus.PENDING)
        .messages({
          'any.only': `${statusMustBeOneOf}: ${Object.values(LoanStatus).join(', ')}`,
        }),

      activeSteps: Joi.string().valid('personalDetails').required().messages({
        'any.required': activeStepsIsRequired,
        'any.only': activeStepsMustPersonalDetails,
      }),
    }).unknown(true);
  }
}

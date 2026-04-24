import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { LoanStatus } from '../loanEntity/loanEntity';
import {
  aadharCardFileKeyIsRequired,
  aadharNumberIsRequired,
  aadharNumberMustBe12Or16Digits,
  activeStepsIsRequired,
  activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
  alternatNoIsRequired,
  atLeastOneFieldMustBeProvidedForpdate,
  bankStatementFileKeyIsRequired,
  companyExpNoIsRequired,
  currentAddressNameIsRequired,
  designationIsRequired,
  landmarkIsRequired,
  maritalStatusNameIsRequired,
  motherNameIsRequired,
  officeAddressIsRequired,
  officeMobileNoIsRequired,
  PANCardFileKeyIsRequired,
  panNumberIsRequired,
  PANnumberMustFollowFormat5Letters4Digits1Letter,
  photoFileKeyIsRequired,
  reference1AddressIsRequired,
  reference1MobileIsRequired,
  reference1NameIsRequired,
  reference2AddressIsRequired,
  reference2MobileIsRequired,
  reference2NameIsRequired,
  salarySilipFileKeyIsRequired,
  statusMustBeOneOf,
  totalWorkExpIsRequired,
  yearsOfCityIsRequired,
} from '../common/loanMessage';

@Injectable()
export class UpdateLoanDTO {
  [key: string]: any;

  static getValidationSchema() {
    const personalDetailsSchema = Joi.object({
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
    });

    const contactDetailsSchema = Joi.object({
      alternateNo: Joi.string().required().messages({
        'any.required': alternatNoIsRequired,
      }),
      yearsOfCity: Joi.number().required().messages({
        'any.required': yearsOfCityIsRequired,
      }),
      landmark: Joi.string().required().messages({
        'any.required': landmarkIsRequired,
      }),
    });

    const employmentDetailsSchema = Joi.object({
      designation: Joi.string().required().messages({
        'any.required': designationIsRequired,
      }),
      companyExp: Joi.number().required().messages({
        'any.required': companyExpNoIsRequired,
      }),
      totalWorkExp: Joi.number().required().messages({
        'any.required': totalWorkExpIsRequired,
      }),
      officeMobile: Joi.string().required().messages({
        'any.required': officeMobileNoIsRequired,
      }),
      officeAddress: Joi.string().required().messages({
        'any.required': officeAddressIsRequired,
      }),
    });

    const referenceDetailsSchema = Joi.object({
      ref1Name: Joi.string().required().messages({
        'any.required': reference1NameIsRequired,
      }),
      ref1Mobile: Joi.string().required().messages({
        'any.required': reference1MobileIsRequired,
      }),
      ref1Address: Joi.string().required().messages({
        'any.required': reference1AddressIsRequired,
      }),
      ref2Name: Joi.string().required().messages({
        'any.required': reference2NameIsRequired,
      }),
      ref2Mobile: Joi.string().required().messages({
        'any.required': reference2MobileIsRequired,
      }),
      ref2Address: Joi.string().required().messages({
        'any.required': reference2AddressIsRequired,
      }),
    });

    const documentsSchema = Joi.object({
      aadharCardFileKey: Joi.string().allow(null, '').required().messages({
        'any.required': aadharCardFileKeyIsRequired,
      }),
      panCardFileKey: Joi.string().allow(null, '').required().messages({
        'any.required': PANCardFileKeyIsRequired,
      }),
      photoFileKey: Joi.string().allow(null, '').required().messages({
        'any.required': photoFileKeyIsRequired,
      }),
      salarySlipsFileKey: Joi.string().allow(null, '').required().messages({
        'any.required': salarySilipFileKeyIsRequired,
      }),
      bankStatementFileKey: Joi.string().allow(null, '').required().messages({
        'any.required': bankStatementFileKeyIsRequired,
      }),
    });
    const reviewSchema = Joi.object({
      submit: Joi.number().required(),
    });

    const baseSchema = Joi.object({
      status: Joi.string()
        .valid(...Object.values(LoanStatus))
        .messages({
          'any.only': `${statusMustBeOneOf}: ${Object.values(LoanStatus).join(', ')}`,
        }),
      activeSteps: Joi.string()
        .valid(
          'personalDetails',
          'contactDetails',
          'employmentDetails',
          'referenceDetails',
          'documents',
          'review',
        )
        .required()
        .messages({
          'any.required': activeStepsIsRequired,
          'any.only':
            activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
        }),
    });

    return baseSchema
      .when(
        Joi.object({ activeSteps: Joi.valid('personalDetails') }).unknown(),
        {
          then: baseSchema.concat(personalDetailsSchema),
        },
      )
      .when(
        Joi.object({ activeSteps: Joi.valid('contactDetails') }).unknown(),
        {
          then: baseSchema.concat(contactDetailsSchema),
        },
      )
      .when(
        Joi.object({ activeSteps: Joi.valid('employmentDetails') }).unknown(),
        {
          then: baseSchema.concat(employmentDetailsSchema),
        },
      )
      .when(
        Joi.object({ activeSteps: Joi.valid('referenceDetails') }).unknown(),
        {
          then: baseSchema.concat(referenceDetailsSchema),
        },
      )
      .when(Joi.object({ activeSteps: Joi.valid('documents') }).unknown(), {
        then: baseSchema.concat(documentsSchema),
      })
      .when(Joi.object({ activeSteps: Joi.valid('review') }).unknown(), {
        then: baseSchema.concat(reviewSchema),
      })
      .messages({
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

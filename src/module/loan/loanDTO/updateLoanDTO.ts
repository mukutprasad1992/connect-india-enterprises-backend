import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { LoanStatus } from '../loanEntity/loanEntity';
import {
    aadharNumberIsRequired,
    aadharNumberMustBe12Or16Digits,
    activeStepsIsRequired,
    activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
    atLeastOneFieldMustBeProvidedForpdate,
    currentAddressNameIsRequired,
    maritalStatusNameIsRequired,
    motherNameIsRequired,
    panNumberIsRequired,
    PANnumberMustFollowFormat5Letters4Digits1Letter,
    statusMustBeOneOf,
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
                    'string.pattern.base': PANnumberMustFollowFormat5Letters4Digits1Letter,
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
            alternateNo: Joi.string().required(),
            yearsOfCity: Joi.string().required(),
            landmark: Joi.string().required(),

        });

        const employmentDetailsSchema = Joi.object({
            designation: Joi.string().required(),
            companyExp: Joi.number().required(),
            totalWorkExp: Joi.number().required(),
            officeMobile: Joi.string().required(),
            officeAddress: Joi.string().required()
        });

        const referenceDetailsSchema = Joi.object({
            ref1Name: Joi.string().required(),
            ref1Mobile: Joi.string().required(),
            ref1Address: Joi.string().required(),
            ref2Name: Joi.string().required(),
            ref2Mobile: Joi.string().required(),
            ref2Address: Joi.string().required(),
        });

        const documentsSchema = Joi.object({
            aadharCardFileKey: Joi.string().allow(null, '').required(),
            panCardFileKey: Joi.string().allow(null, '').required(),
            photoFileKey: Joi.string().allow(null, '').required(),
            salarySlipsFileKey: Joi.string().allow(null, '').required(),
            bankStatementFileKey: Joi.string().allow(null, '').required(),
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
                .valid('personalDetails', 'contactDetails', 'employmentDetails', 'referenceDetails', 'documents', 'review')
                .required()
                .messages({
                    'any.required': activeStepsIsRequired,
                    'any.only': activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
                }),
        });

        return baseSchema.when(Joi.object({ activeSteps: Joi.valid('personalDetails') }).unknown(), {
            then: baseSchema.concat(personalDetailsSchema),
        })
            .when(Joi.object({ activeSteps: Joi.valid('contactDetails') }).unknown(), {
                then: baseSchema.concat(contactDetailsSchema),
            })
            .when(Joi.object({ activeSteps: Joi.valid('employmentDetails') }).unknown(), {
                then: baseSchema.concat(employmentDetailsSchema),
            })
            .when(Joi.object({ activeSteps: Joi.valid('referenceDetails') }).unknown(), {
                then: baseSchema.concat(referenceDetailsSchema),
            })
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

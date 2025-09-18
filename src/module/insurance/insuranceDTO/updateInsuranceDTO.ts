import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { InsuranceStatus } from '../insuranceEntity/insuranceEntity';
import {
    aadharNumberIsRequired,
    aadharNumberMustBe12Or16Digits,
    activeStepsIsRequired,
    activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
    alcoholMustBeEitherYesOrNo,
    alcoholStatusIsRequired,
    atLeastOneFieldMustBeProvidedForpdate,
    heightIsRequired,
    heightMustBeANumber,
    panNumberIsRequired,
    PANnumberMustFollowFormat5Letters4Digits1Letter,
    smokerMustBeEitherYesOrNo,
    smokerStatusIsRequired,
    statusMustBeOneOf,
    weightIsRequired,
    weightMustBeANumber
} from '../common/insuranceMessage';

@Injectable()
export class UpdateInsuranceDTO {
    [key: string]: any;

    static getValidationSchema() {
        const basicDetailsSchema = Joi.object({
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
        });

        const personalDetailsSchema = Joi.object({
            motherName: Joi.string().required(),
            heightCM: Joi.number()
                .required()
                .messages({
                    'string.pattern.base': heightMustBeANumber,
                    'any.required': heightIsRequired,
                }),
            placeOfBirth: Joi.object({
                city: Joi.string().required(),
                state: Joi.string().required(),
            }).required(),
            income: Joi.string().required(),
            weightKG: Joi.number()
                .required()
                .messages({
                    'string.pattern.base': weightMustBeANumber,
                    'any.required': weightIsRequired,
                }),
            occupation: Joi.string().required(),
            smoker: Joi.string().valid('Yes', 'No').required().messages({
                'any.only': smokerMustBeEitherYesOrNo,
                'any.required': smokerStatusIsRequired,
            }),
            alcohol: Joi.string().valid('Yes', 'No').required().messages({
                'any.only': alcoholMustBeEitherYesOrNo,
                'any.required': alcoholStatusIsRequired,
            }),
        });

        const nomineeDetailsSchema = Joi.object({
            nomineeName: Joi.string().required(),
            nomineeDOB: Joi.string().required(),
            nomineeRelation: Joi.string().required(),
        });

        const documentsSchema = Joi.object({
            aadharCardFileKey: Joi.string().allow(null, '').required(),
            panCardFileKey: Joi.string().allow(null, '').required(),
            bankProofFileKey: Joi.string().allow(null, '').required(),
            salarySlipsFileKey: Joi.string().allow(null, '').required(),
            itrDocumentsFileKey: Joi.string().allow(null, '').required(),
        });
        const reviewSchema = Joi.object({
            submit: Joi.number().required(),
        });

        const baseSchema = Joi.object({
            status: Joi.string()
                .valid(...Object.values(InsuranceStatus))
                .messages({
                    'any.only': `${statusMustBeOneOf}: ${Object.values(InsuranceStatus).join(', ')}`,
                }),
            activeSteps: Joi.string()
                .valid('basicDetails', 'personalDetails', 'nomineeDetails', 'documents', 'review')
                .required()
                .messages({
                    'any.required': activeStepsIsRequired,
                    'any.only': activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
                }),
        });

        return baseSchema.when(Joi.object({ activeSteps: Joi.valid('basicDetails') }).unknown(), {
            then: baseSchema.concat(basicDetailsSchema),
        })
            .when(Joi.object({ activeSteps: Joi.valid('personalDetails') }).unknown(), {
                then: baseSchema.concat(personalDetailsSchema),
            })
            .when(Joi.object({ activeSteps: Joi.valid('nomineeDetails') }).unknown(), {
                then: baseSchema.concat(nomineeDetailsSchema),
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

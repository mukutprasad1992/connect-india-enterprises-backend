import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';
import {
    aadharNumberIsRequired,
    aadharNumberMustBe12Or16Digits,
    activeStepsIsRequired,
    activeStepsMustBeOneOfBasicDetailsPersonalDetailsNomineeDetailsDocumentsReview,
    atLeastOneFieldMustBeProvidedForpdate,
    mobileIsRequired,
    mobileMustBeInTheFormat,
    nomineeMobileIsRequired,
    panNumberIsRequired,
    PANnumberMustFollowFormat5Letters4Digits1Letter,
    statusMustBeOneOf
} from '../common/serviceTypeMessage';

@Injectable()
export class UpdateServiceTypeDTO {
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
            email: Joi.string().email().required(),
            mobile: Joi.string()
                .pattern(/^\+91\s?[6-9]\d{9}$/)
                .required()
                .messages({
                    'string.pattern.base': mobileMustBeInTheFormat,
                    'any.required': mobileIsRequired,
                }),
            placeOfBirth: Joi.object({
                city: Joi.string().required(),
                state: Joi.string().required(),
            }).required(),
            income: Joi.string().required(),
            occupation: Joi.string().required(),
        });

        const nomineeDetailsSchema = Joi.object({
            nomineeIdType: Joi.string().required(),
            nomineeId: Joi.string().required(),
            nomineeMobile: Joi.string()
                .trim()
                .pattern(/^\+91\s?[6-9]\d{9}$/)
                .required()
                .messages({
                    'string.pattern.base': mobileMustBeInTheFormat,
                    'any.required': nomineeMobileIsRequired,
                }),
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
                .valid(...Object.values(ServiceTypeStatus))
                .messages({
                    'any.only': `${statusMustBeOneOf}: ${Object.values(ServiceTypeStatus).join(', ')}`,
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

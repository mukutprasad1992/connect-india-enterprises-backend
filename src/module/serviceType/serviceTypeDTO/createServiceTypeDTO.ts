import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';
import {
    aadharNumberIsRequired,
    aadharNumberMustBe12Or16Digits,
    activeStepsIsRequired,
    activeStepsMustBeDasicDetails,
    panNumberIsRequired,
    PANnumberMustFollowFormat5Letters4Digits1Letter,
    serviceIdIsRequired,
    serviceIdMustAbeNumber,
    serviceSubTypeIsRequired,
    serviceSubTypeMustBeAString,
    statusMustBeOneOf
} from '../common/serviceTypeMessage';

@Injectable()
export class CreateServiceTypeDTO {
    [key: string]: any;

    static getValidationSchema() {
        return Joi.object({
            serviceId: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    'any.required': serviceIdIsRequired,
                    'number.base': serviceIdMustAbeNumber,
                }),

            ServiceSubType: Joi.string()
                .trim()
                .required()
                .messages({
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
                    'string.pattern.base': PANnumberMustFollowFormat5Letters4Digits1Letter,
                    'any.required': panNumberIsRequired,
                }),

            status: Joi.string()
                .valid(...Object.values(ServiceTypeStatus))
                .default(ServiceTypeStatus.PENDING)
                .messages({
                    'any.only': `${statusMustBeOneOf}: ${Object.values(ServiceTypeStatus).join(', ')}`,
                }),

            activeSteps: Joi.string()
                .valid('basicDetails')
                .required()
                .messages({
                    'any.required': activeStepsIsRequired,
                    'any.only': activeStepsMustBeDasicDetails,
                }),
        }).unknown(true);
    }
}

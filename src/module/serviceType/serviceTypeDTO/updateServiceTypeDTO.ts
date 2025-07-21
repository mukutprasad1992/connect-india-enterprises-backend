import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';
import { atLeastOneFieldMustBeProvidedForpdate } from '../common/serviceTypeMessage';

@Injectable()
export class UpdateServiceTypeDTO {
    [key: string]: any;

    static getValidationSchema() {
        const baseSchema = {
            status: Joi.string()
                .valid(...Object.values(ServiceTypeStatus))
                .messages({
                    'any.only': `Status must be one of: ${Object.values(ServiceTypeStatus).join(', ')}`
                }),
        };
        return Joi.object(baseSchema)
            .unknown(true)
            .min(1)
            .messages({
                'object.min': atLeastOneFieldMustBeProvidedForpdate,
            });
    }

    static validate(data: any) {
        const schema = this.getValidationSchema();
        return schema.validate(data, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        });
    }
}
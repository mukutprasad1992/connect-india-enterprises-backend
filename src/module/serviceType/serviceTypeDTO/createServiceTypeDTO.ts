import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';

@Injectable()
export class CreateServiceTypeDTO {
    [key: string]: any;

    static getValidationSchema() {
        return Joi.object({
            status: Joi.string()
                .valid(...Object.values(ServiceTypeStatus))
                .default(ServiceTypeStatus.PENDING)
                .messages({
                    'any.only': `Status must be one of: ${Object.values(ServiceTypeStatus).join(', ')}`
                }),
        }).unknown(true);
    }
}
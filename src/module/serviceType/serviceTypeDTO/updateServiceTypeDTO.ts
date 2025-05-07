import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';


@Injectable()
export class UpdateServiceTypeDTO {
    amount?: number;
    type?: string;
    duration?: string;
    status?: ServiceTypeStatus;
    description?: string;
    comment: string;
    fromTime: string;
    toTime: string;

    static serviceTypeSchema = Joi.object({
        amount: Joi.number().positive().precision(2).optional(),
        type: Joi.string().min(1).max(100).optional(),
        duration: Joi.string().min(1).max(50).optional(),
        fromTime: Joi.string().min(1).max(50).optional(),
        toTime: Joi.string().min(1).max(50).optional(),
        status: Joi.string()
            .valid(...Object.values(ServiceTypeStatus))
            .optional(),
        description: Joi.string().min(1).max(500).optional(),
        comment: Joi.string().allow('').max(255).optional(),
    });
}

import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceTypeStatus } from '../serviceTypeEntity/serviceTypeEntity';
import { join } from 'path';


@Injectable()
export class CreateServiceTypeDTO {
    amount: number;
    serviceSubType: string;
    duration: string;
    status?: ServiceTypeStatus;
    comment: string;
    serviceId: number;
    createdBy: string;
    fromTime: string;
    toTime: string;

    static ServiceTypeSchema = Joi.object({
        amount: Joi.number().positive().precision(2).required(),
        serviceId: Joi.number().positive().precision(1).required(),
        serviceSubType: Joi.string().min(1).max(100).required(),
        createdBy: Joi.string().min(1).max(100),
        duration: Joi.string().min(1).max(50).required(),
        fromTime: Joi.string().min(1).max(50).required(),
        toTime: Joi.string().min(1).max(50).required(),
        status: Joi.string()
            .valid(...Object.values(ServiceTypeStatus))
            .default(ServiceTypeStatus.PENDING),
        comment: Joi.string().allow('').max(255).optional(),
    });
}

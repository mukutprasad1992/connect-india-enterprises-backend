import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceType } from '../serviceEntity/serviceEntity';

@Injectable()
export class UpdateServiceDTO {
    serviceType?: ServiceType;
    description?: string;

    static serviceSchema = Joi.object({
        serviceType: Joi.string()
            .valid(...Object.values(ServiceType))
            .optional(),
    });
}
import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ServiceType } from '../serviceEntity/serviceEntity';
import { join } from 'path';

@Injectable()
export class CreateServiceDTO {
  serviceType?: ServiceType;
  createdBy: string;

  static ServiceSchema = Joi.object({
    createdBy: Joi.number().min(1).max(100),
    serviceType: Joi.string().valid(...Object.values(ServiceType)),
  });
}

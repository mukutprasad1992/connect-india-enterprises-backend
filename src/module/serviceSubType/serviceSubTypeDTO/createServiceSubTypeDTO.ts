import { IsEnum, IsDateString, IsOptional, IsNumber } from 'class-validator';
import * as Joi from 'joi';
import { ServiceSubType } from '../serviceSubTypeEntity/serviceSubTypeEntity';

export class ServiceSubTypeDTO {
  @IsEnum(ServiceSubType)
  ledgerType: ServiceSubType;
  @IsNumber()
  serviceId: number;

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  static ServiceSubTypeSchema = Joi.object({
    ledgerType: Joi.string()
      .valid(...Object.values(ServiceSubType))
      .required(),
    serviceId: Joi.number().required(),
    createdAt: Joi.date().iso().optional(),
  });
}

import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import * as Joi from 'joi';
import { ServiceSubType } from '../serviceSubTypeEntity/serviceSubTypeEntity';

export class UpdateServiceSubTypeDTO {
  @IsEnum(ServiceSubType)
  ledgerType: ServiceSubType;

  @IsDateString()
  @IsOptional()
  createdAt?: Date;
  static get ServiceSubTypeSchema() {
    return Joi.object({
      ledgerType: Joi.string()
        .valid(...Object.values(ServiceSubType))
        .required(),
      createdAt: Joi.date().iso().optional(),
    });
  }
}

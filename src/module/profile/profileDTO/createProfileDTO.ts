import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class CreateUserDto {
  firstName: string;
  lastName: string;
  mobileNo: string;
  createdBy?: number;
  address?: string;
  pinCode?: number;
  profileImageURL?: string;

  static userSchema = Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    mobileNo: Joi.string()
      .trim()
      .pattern(/^[0-9]{10,15}$/)
      .required(),
    createdBy: Joi.number().integer().optional(),
    address: Joi.string().max(255).optional().allow(null, ''),
    pinCode: Joi.number().integer().optional(),
    profileImageURL: Joi.string().max(500).optional().allow(null, ''),
  });
}

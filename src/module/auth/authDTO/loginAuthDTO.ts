import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { AuthValidationMessages } from '../common/authMessage';

@Injectable()
export class LoginDTO {
  email: string;
  password: string;

  static loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': AuthValidationMessages.email.email,
      'any.required': AuthValidationMessages.email.required,
    }),
    password: Joi.string().min(6).max(20).required().messages({
      'string.min': AuthValidationMessages.password.min,
      'string.max': AuthValidationMessages.password.max,
      'any.required': AuthValidationMessages.password.required,
    }),
  });
}

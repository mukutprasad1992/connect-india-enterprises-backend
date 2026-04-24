import * as Joi from 'joi';
import { AuthValidationMessages } from '../common/authMessage';

export class ResetPasswordDTO {
  newPassword: string;
  token: string;

  static resetPasswordSchema = Joi.object({
    newPassword: Joi.string()
      .min(6)
      .max(20)
      .pattern(
        new RegExp(
          '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=]).{6,20}$',
        ),
      )
      .required()
      .messages({
        'string.min': AuthValidationMessages.newPassword.min,
        'string.max': AuthValidationMessages.newPassword.max,
        'string.pattern.base': AuthValidationMessages.newPassword.pattern,
        'any.required': AuthValidationMessages.newPassword.required,
      }),
    token: Joi.string().required().messages({
      'any.required': AuthValidationMessages.token.required,
    }),
  });
}

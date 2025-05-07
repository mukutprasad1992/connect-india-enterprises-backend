import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { AuthValidationMessages } from '../common/authMessage';

@Injectable()
export class ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;

    static changePasswordSchema = Joi.object({
        oldPassword: Joi.string().min(6).max(20).required().messages({
            "string.min": AuthValidationMessages.oldPassword.min,
            "string.max": AuthValidationMessages.oldPassword.max,
            "any.required": AuthValidationMessages.oldPassword.required
        }),
        newPassword: Joi.string().min(6).max(20).pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=]).{6,20}$'))
            .required().messages({
                "string.min": AuthValidationMessages.newPassword.min,
                "string.max": AuthValidationMessages.newPassword.max,
                "string.pattern.base": AuthValidationMessages.newPassword.pattern,
                "any.required": AuthValidationMessages.newPassword.required
            }),
    });
}

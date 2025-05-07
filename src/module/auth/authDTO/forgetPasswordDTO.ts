import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { AuthValidationMessages } from '../common/authMessage';

@Injectable()
export class ForgetPasswordDTO {
    email: string;

    static forgetPasswordSchema = Joi.object({
        email: Joi.string().email().required(),
    });
}
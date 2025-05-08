import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { UserStatus } from '../userEntity/userSchema'
@Injectable()
export class CreateUserDTO {
    email?: string;
    password?: string;
    mobileNo?: string;
    roleId?: Number;
    businessName?: string;
    businessRepresentative?: string;
    vendorCode?: string;
    address?: string;
    status: UserStatus;

    static userSchema = Joi.object({
        email: Joi.string().email().required(),
        status: Joi.string()
            .valid(...Object.values(UserStatus))
            .default(UserStatus.Enable).required(),
        password: Joi.string()
            .min(6)
            .max(20)
            .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=]).{6,20}$'))
            .optional()
            .when('roleId', {
                is: Joi.not(2),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
        mobileNo: Joi.string()
            .trim()
            .pattern(/^[0-9]{10,12}$/)
            .required(),
        roleId: Joi.number().required(),
        businessName: Joi.string()
            .max(255)
            .optional()
            .when('roleId', {
                is: 2,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),
        businessRepresentative: Joi.string()
            .max(255)
            .optional()
            .when('roleId', {
                is: 2,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),
        vendorCode: Joi.string()
            .max(50)
            .optional()
            .when('roleId', {
                is: 2,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),
        address: Joi.string().max(100).optional()
    });
}

import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { UserStatus } from '../userEntity/userSchema'

@Injectable()
export class UpdateUserDTO {
    email?: string;
    password?: string;
    mobileNo?: string;
    roleId?: number;
    businessName?: string;
    businessRepresentative?: string;
    vendorCode?: string;
    address?: string;
    status: UserStatus;

    static userSchema = Joi.object({
        email: Joi.string().email().optional(),
        password: Joi.string()
            .min(6)
            .max(20)
            .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=]).{6,20}$'))
            .optional(),
        mobileNo: Joi.string().pattern(/^[0-9]{10,12}$/).optional(),
        roleId: Joi.number().optional(),
        businessName: Joi.string().max(255).optional(),
        businessRepresentative: Joi.string().max(255).optional(),
        vendorCode: Joi.string().max(50).optional(),
        address: Joi.string().max(100).optional(),
        status: Joi.string()
            .valid(...Object.values(UserStatus))
            .optional(),
    });
}

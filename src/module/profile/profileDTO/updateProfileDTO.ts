import * as Joi from 'joi';

export class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    mobileNo?: string;
    updatedBy?: number;
    address?: string;
    pinCode?: number;
    profileImageURL?: string;
    static userSchema = Joi.object({
        firstName: Joi.string().min(1).max(100).optional(),
        lastName: Joi.string().min(1).max(100).optional(),
        mobileNo: Joi.string().trim().pattern(/^[0-9]{10,15}$/).optional(),
        updatedBy: Joi.number().integer().optional(),
        address: Joi.string().max(255).optional().allow(null, ''),
        pinCode: Joi.number().integer().optional(),
        profileImageURL: Joi.string().max(100).optional().allow(null, ''),
    });
}

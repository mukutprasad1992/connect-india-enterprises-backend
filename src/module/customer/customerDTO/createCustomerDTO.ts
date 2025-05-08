import * as Joi from 'joi';

export class CreateCustomerDTO {
    name: string;
    address: string;
    phone?: string;
    email: string;
    pincode: string;

    static customerSchema = Joi.object({
        name: Joi.string().min(1).max(255).required(),
        address: Joi.string().min(1).max(255).required(),
        phone: Joi.string().pattern(/^[0-9]{0,15}$/).optional(),
        email: Joi.string().email().min(1).max(255).required(),
        pincode: Joi.string().length(6).required(),
    });

    static validate(customer: CreateCustomerDTO) {
        const { error } = CreateCustomerDTO.customerSchema.validate(customer);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}

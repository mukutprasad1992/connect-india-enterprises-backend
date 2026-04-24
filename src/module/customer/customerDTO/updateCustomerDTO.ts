import * as Joi from 'joi';

export class UpdateCustomerDTO {
  name: string;
  address: string;
  phone?: string;
  email: string;
  pincode: string;

  static customerSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    address: Joi.string().min(1).max(255).optional(),
    phone: Joi.string()
      .pattern(/^[0-9]{0,15}$/)
      .optional(),
    email: Joi.string().email().min(1).max(255).optional(),
    pincode: Joi.string().length(6).optional(),
  });

  static validate(customer: UpdateCustomerDTO) {
    const { error } = UpdateCustomerDTO.customerSchema.validate(customer);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

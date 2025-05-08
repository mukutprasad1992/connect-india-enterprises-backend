import * as Joi from 'joi';
import { VoucherStatus } from '../voucherEntity/voucherRecordSchema';
export class UpdateVoucherDTO {
    amount: number;
    voucherCode: string;
    validityFrom: Date;
    validityTo: Date;
    customerId: number;
    vendorId: number;
    status: VoucherStatus;

    static voucherSchema = Joi.object({
        amount: Joi.number().min(0).optional(),
        voucherCode: Joi.string().min(1).max(255).optional(),
        validityFrom: Joi.date().iso().optional(),
        validityTo: Joi.date().iso().optional(),
        customerId: Joi.number().positive().optional(),
        vendorId: Joi.number().positive().optional(),
        status: Joi.string()
            .valid(...Object.values(VoucherStatus))
            .optional(),
    });

    static validate(voucher: UpdateVoucherDTO) {
        const { error } = UpdateVoucherDTO.voucherSchema.validate(voucher);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}

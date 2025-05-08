import * as Joi from 'joi';
import { VoucherStatus } from '../voucherEntity/voucherRecordSchema';

export class CeateVoucherDTO {
    amount: number;
    voucherCode: string;
    validityFrom: Date;
    validityTo: Date;
    customerId: number;
    vendorId: number;
    status?: VoucherStatus;

    static voucherSchema = Joi.object({
        amount: Joi.number().min(0).required(),
        voucherCode: Joi.string().min(1).max(255).required(),
        validityFrom: Joi.date().iso().required(),
        validityTo: Joi.date().iso().required(),
        customerId: Joi.number().positive().required(),
        vendorId: Joi.number().positive().required(),
        status: Joi.string()
            .valid(...Object.values(VoucherStatus))
            .default(VoucherStatus.Enable),
    });

    static validate(voucher: CeateVoucherDTO) {
        const { error } = CeateVoucherDTO.voucherSchema.validate(voucher);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}

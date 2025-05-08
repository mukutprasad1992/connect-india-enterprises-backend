import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { errorRetrievingVouchers, vouchersRetrievedSuccessfully } from '../common/voucherMessage';

@Injectable()
export class GetAllVoucherService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllVouchers(): Promise<any> {
        try {
            const query = `
                   SELECT
        v.id,   v.amount,  v.voucherCode, v.validityFrom, v.validityTo,
        v.customerId,  v.vendorId,  c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone,
        c.email AS customerEmail, c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo,
        u.businessName AS vendorBusinessName, u.businessRepresentative AS vendorBusinessRepresentative,
        u.vendorCode AS vendorCode,  u.address AS vendorAddress, v.status AS status, v.createdAt AS CreatedAt,
        v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt,  v.updatedBy AS UpdatedBy
        FROM
            vouchers v
        LEFT JOIN
            customers c ON v.customerId = c.id
        LEFT JOIN
        users u ON v.vendorId = u.id;

            `;
            const vouchers = await this.dataSource.query(query);
            return {
                status: true,
                message: vouchersRetrievedSuccessfully,
                data: vouchers,
            };
        } catch (error) {
            return {
                status: false,
                message: errorRetrievingVouchers,
                error: error.message,
                data: null,
            };
        }
    }
}

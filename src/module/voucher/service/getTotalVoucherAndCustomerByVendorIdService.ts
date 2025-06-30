import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    errorRetrievingVouchersAndCustomers,
    voucherAndCustomerRecordNotFound,
    vouchersAndCustomerRetrievedSuccessfully
} from '../common/voucherMessage';

@Injectable()
export class GetTotalVoucherAndCustomerByVendorIdService {
    constructor(
        private dataSource: DataSource,
    ) { }

    async getVoucherAndCustomerById(vendorId: number): Promise<any> {
        try {
            const query = `
               SELECT
                    v.vendorId,
                    COUNT(DISTINCT v.customerId) AS totalCustomers,
                    COUNT(v.id) AS totalVouchers
                FROM
                    vouchers v
                LEFT JOIN
                    customers c ON v.customerId = c.id
                WHERE
                    v.vendorId = ?
                GROUP BY
                    v.vendorId;
            `;
            const voucherAndCjustomer = await this.dataSource.query(query, [vendorId]);
            if (voucherAndCjustomer.length === 0) {
                return {
                    status: false,
                    message: voucherAndCustomerRecordNotFound,
                    data: null,
                };
            }

            return {
                status: true,
                message: vouchersAndCustomerRetrievedSuccessfully,
                data: voucherAndCjustomer[0],
            };
        } catch (error) {
            return {
                status: false,
                message: errorRetrievingVouchersAndCustomers,
                error: error.message,
                data: null,
            };
        }
    }
}

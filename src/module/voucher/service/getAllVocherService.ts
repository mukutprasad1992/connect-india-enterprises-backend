import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { errorRetrievingVouchers, errorRretrievingVouchers, getAllVoucherServiceCalled, vouchersRetrievedSuccessfully, vouchersRetrievedSuccessfullyCount } from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllVoucherService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getAllVouchers(): Promise<any> {
        this.logger.doLog(`${getAllVoucherServiceCalled}`, 'info');

        try {
            const query = `
                SELECT
                    v.id, v.amount, v.voucherCode, v.validityFrom, v.validityTo,
                    v.customerId, v.vendorId, c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone,
                    c.email AS customerEmail, c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo,
                    u.businessName AS vendorBusinessName, u.businessRepresentative AS vendorBusinessRepresentative,
                    u.vendorCode AS vendorCode, u.pinCode AS vendorPincode, u.address AS vendorAddress, v.status AS status, v.pdfURL AS pdfURL, v.createdAt AS CreatedAt,
                    v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt, v.updatedBy AS UpdatedBy
                FROM
                    vouchers v
                LEFT JOIN
                    customers c ON v.customerId = c.id
                LEFT JOIN
                    users u ON v.vendorId = u.id
                ORDER BY id DESC;
            `;

            const vouchers = await this.dataSource.query(query);

            this.logger.doLog(`${vouchersRetrievedSuccessfullyCount} ${vouchers.length}`, 'success');

            return {
                status: true,
                message: vouchersRetrievedSuccessfully,
                data: vouchers,
            };
        } catch (error) {
            this.logger.doLog(`${errorRretrievingVouchers} ${error.message}`, 'error');

            return {
                status: false,
                message: errorRetrievingVouchers,
                error: error.message,
                data: null,
            };
        }
    }
}

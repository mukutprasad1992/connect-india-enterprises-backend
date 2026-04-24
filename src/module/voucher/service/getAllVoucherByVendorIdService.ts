import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  errorRetrievingVouchers,
  errorRetrievingVouchersForVendorId,
  getAllVouchersByVendorIdServiceCalledForVendorId,
  noVouchersFoundForVendorId,
  voucherRecordNotFound,
  vouchersRetrievedSuccessfully,
  vouchersRetrievedSuccessfullyForVendorId,
} from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllVouchersByVendorIdService {
  constructor(
    private dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getAllVouchersByVendorId(vendorId: number): Promise<any> {
    this.logger.doLog(
      `${getAllVouchersByVendorIdServiceCalledForVendorId} ${vendorId}`,
      'info',
    );

    try {
      const query = `
                SELECT
                    v.id, v.amount, v.voucherCode, v.validityFrom, v.validityTo, v.customerId, v.vendorId,
                    c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone, c.email AS customerEmail,
                    c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo, u.businessName AS vendorBusinessName,
                    u.businessRepresentative AS vendorBusinessRepresentative, u.pinCode AS vendorPincode, u.vendorCode AS vendorCode, u.address AS vendorAddress, v.status AS status, v.pdfURL AS pdfURL,
                    v.createdAt AS CreatedAt, v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt, v.updatedBy AS UpdatedBy
                FROM
                    vouchers v
                LEFT JOIN
                    customers c ON v.customerId = c.id
                LEFT JOIN
                    users u ON v.vendorId = u.id
                WHERE
                    v.vendorId = ? ORDER BY id DESC;
            `;

      const vouchers = await this.dataSource.query(query, [vendorId]);

      if (vouchers.length === 0) {
        this.logger.doLog(`${noVouchersFoundForVendorId} ${vendorId}`, 'warn');
        return {
          status: false,
          message: voucherRecordNotFound,
          data: [],
        };
      }

      this.logger.doLog(
        `${vouchersRetrievedSuccessfullyForVendorId} ${vendorId}. Count: ${vouchers.length}`,
        'success',
      );

      return {
        status: true,
        message: vouchersRetrievedSuccessfully,
        data: vouchers,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorRetrievingVouchersForVendorId} ${vendorId}, error: ${error.message}`,
        'error',
      );

      return {
        status: false,
        message: errorRetrievingVouchers,
        error: error.message,
        data: [],
      };
    }
  }
}

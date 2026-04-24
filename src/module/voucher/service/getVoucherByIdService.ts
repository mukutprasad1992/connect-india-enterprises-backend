import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  errorRetrievingVoucherForVoucherId,
  errorRetrievingVouchers,
  getVoucherByIdServiceCalledForVoucherId,
  voucherNotFoundForVoucherId,
  voucherRecordNotFound,
  voucherRetrievedSuccessfullyForVoucherId,
  vouchersRetrievedSuccessfully,
} from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetVoucherByIdService {
  constructor(
    private dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getVoucherById(voucherId: number): Promise<any> {
    this.logger.doLog(
      `${getVoucherByIdServiceCalledForVoucherId} ${voucherId}`,
      'info',
    );

    try {
      const query = `
                SELECT
                    v.id, v.amount, v.voucherCode, v.validityFrom, v.validityTo, v.customerId, v.vendorId,
                    c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone, c.email AS customerEmail,
                    c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo, u.businessName AS vendorBusinessName,
                    u.businessRepresentative AS vendorBusinessRepresentative, u.pinCode AS vendorPincode, u.vendorCode AS vendorCode, u.address AS vendorAddress, v.pdfURL AS pdfURL,
                    v.createdAt AS CreatedAt, v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt, v.updatedBy AS UpdatedBy
                FROM
                    vouchers v
                LEFT JOIN
                    customers c ON v.customerId = c.id
                LEFT JOIN
                    users u ON v.vendorId = u.id
                WHERE
                    v.id = ? ORDER BY id DESC;
            `;

      const voucher = await this.dataSource.query(query, [voucherId]);

      if (voucher.length === 0) {
        this.logger.doLog(
          `${voucherNotFoundForVoucherId} ${voucherId}`,
          'warn',
        );
        return {
          status: false,
          message: voucherRecordNotFound,
          data: null,
        };
      }

      this.logger.doLog(
        `${voucherRetrievedSuccessfullyForVoucherId} ${voucherId}`,
        'success',
      );

      return {
        status: true,
        message: vouchersRetrievedSuccessfully,
        data: voucher[0],
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorRetrievingVoucherForVoucherId} ${voucherId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: errorRetrievingVouchers,
        error: error.message,
        data: null,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  errorDeletingVoucher,
  voucherRecordNotFound,
  voucherDeletedSuccessfully,
  deleteVoucherByIdServiceCalledForVoucherID,
  notFoundForDeletion,
  deletedSuccessfully,
  voucherID,
  errorDeletingVoucherID,
} from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class DeleteVoucherByIdService {
  constructor(
    private dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async deleteVoucherById(voucherId: number): Promise<any> {
    this.logger.doLog(
      `${deleteVoucherByIdServiceCalledForVoucherID} ${voucherId}`,
      'info',
    );

    try {
      const query = `DELETE FROM vouchers WHERE id = ?;`;
      const result = await this.dataSource.query(query, [voucherId]);

      if (result.affectedRows === 0) {
        this.logger.doLog(
          `${voucherID} ${voucherId} ${notFoundForDeletion}`,
          'warn',
        );
        return {
          status: false,
          message: voucherRecordNotFound,
          data: null,
        };
      }

      this.logger.doLog(
        `${voucherID} ${voucherId} ${deletedSuccessfully}`,
        'success',
      );
      return {
        status: true,
        message: voucherDeletedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorDeletingVoucherID} ${voucherId}: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: errorDeletingVoucher,
        error: error.message,
        data: null,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import {
  voucherNotFound,
  voucherUpdateError,
  voucherStatusUpdatedSuccessfully,
  voucherNotFoundOrNoChangesHaveBeenMade,
  invalidStatusValueProvided,
  updateVoucherStatusServiceCalledForVoucherId,
  invalidStatusValueProvidedForVoucherId,
  voucherNotFoundForVoucherId,
  noChangesMadeWhileUpdatingVoucherId,
  voucherStatusUpdatedSuccessfullyForVoucherId,
  errorUpdatingVoucherStatusForVoucherId,
} from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateVoucherStatusService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getVoucherById(id: number): Promise<VoucherSchema | null> {
    const voucher = await this.dataSource.query(
      'SELECT * FROM vouchers WHERE id = ?',
      [id],
    );
    return voucher.length > 0 ? voucher[0] : null;
  }

  async updateVoucherStatus(
    id: number,
    updateData: UpdateVoucherDTO,
    userId: number,
  ): Promise<any> {
    this.logger.doLog(
      `${updateVoucherStatusServiceCalledForVoucherId} ${id} by userId: ${userId}`,
      'info',
    );

    try {
      const { status } = updateData;

      if (!['Disable'].includes(status)) {
        this.logger.doLog(
          `${invalidStatusValueProvidedForVoucherId} ${id} by userId: ${userId}`,
          'warn',
        );
        return {
          status: false,
          message: invalidStatusValueProvided,
          data: null,
        };
      }

      const voucherExists = await this.getVoucherById(id);
      if (!voucherExists) {
        this.logger.doLog(`${voucherNotFoundForVoucherId} ${id}`, 'warn');
        return {
          status: false,
          message: voucherNotFound,
          data: null,
        };
      }

      const query = `UPDATE vouchers SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE id = ?`;
      const updateResult = await this.dataSource.query(query, [
        status,
        userId,
        id,
      ]);

      if (updateResult.affectedRows === 0) {
        this.logger.doLog(
          `${noChangesMadeWhileUpdatingVoucherId} ${id}`,
          'warn',
        );
        return {
          status: false,
          message: voucherNotFoundOrNoChangesHaveBeenMade,
          data: null,
        };
      }

      const updatedVoucher = await this.getVoucherById(id);
      this.logger.doLog(
        `${voucherStatusUpdatedSuccessfullyForVoucherId} ${id} by userId: ${userId}`,
        'success',
      );

      return {
        status: true,
        message: voucherStatusUpdatedSuccessfully,
        data: updatedVoucher,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorUpdatingVoucherStatusForVoucherId} ${id} by userId: ${userId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: voucherUpdateError,
        error: error.message,
      };
    }
  }
}

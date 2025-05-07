import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { errorDeletingVoucher, voucherRecordNotFound, voucherDeletedSuccessfully } from '../common/voucherMessage';

@Injectable()
export class DeleteVoucherByIdService {
    constructor(
        private dataSource: DataSource,
    ) { }

    async deleteVoucherById(voucherId: number): Promise<any> {
        try {
            const query = `
                DELETE FROM vouchers WHERE id = ?;
            `;

            const result = await this.dataSource.query(query, [voucherId]);

            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: voucherRecordNotFound,
                    data: null,
                };
            }

            return {
                status: true,
                message: voucherDeletedSuccessfully,
                data: null,
            };
        } catch (error) {
            return {
                status: false,
                message: errorDeletingVoucher,
                error: error.message,
                data: null,
            };
        }
    }
}

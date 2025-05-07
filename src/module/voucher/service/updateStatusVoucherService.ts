import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import {
    voucherNotFound,
    voucherUpdateError,
    voucherStatusUpdatedSuccessfully,
    voucherNotFoundOrNoChangesHaveBeenMade,
    invalidStatusValueProvided
} from '../common/voucherMessage';

@Injectable()
export class UpdateVoucherStatusService {
    constructor(private readonly dataSource: DataSource) { }

    async getVoucherById(id: number): Promise<VoucherSchema | null> {
        const serviceType = await this.dataSource.query(
            'SELECT * FROM vouchers WHERE id = ?',
            [id]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    async updateVoucherStatus(id: number, updateData: UpdateVoucherDTO, userId: number): Promise<any> {
        try {
            const { status } = updateData;

            if (!['Disable'].includes(status)) {
                return {
                    status: false,
                    message: invalidStatusValueProvided,
                    data: null
                };
            }

            const serviceTypeExists = await this.getVoucherById(id);
            if (!serviceTypeExists) {
                return {
                    status: false,
                    message: voucherNotFound,
                    data: null
                };
            }

            const query = `UPDATE vouchers SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE id = ?`;
            const updateResult = await this.dataSource.query(query, [status, userId, id]);

            if (updateResult.affectedRows === 0) {
                return {
                    status: false,
                    message: voucherNotFoundOrNoChangesHaveBeenMade,
                    data: null
                };
            }

            const updatedServiceType = await this.getVoucherById(id);
            return {
                status: true,
                message: voucherStatusUpdatedSuccessfully,
                data: updatedServiceType
            };

        } catch (error) {
            return {
                status: false,
                message: voucherUpdateError,
                error: error.message
            };
        }
    }
}

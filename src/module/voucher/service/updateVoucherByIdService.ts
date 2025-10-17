import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { DataSource, Repository } from "typeorm";
import {
    anErrorOccurredWhileUpdatingTheVoucher,
    errorUpdatingVoucherId,
    updateVoucherServiceCalledForVoucherId,
    voucherCodeIsAlreadyExist,
    voucherUpdatedSuccessfully,
    voucherUpdatedSuccessfullyForVoucherId,
    voucherUpdateFailedNoRowsAffectedForVoucherId,
    voucherUpdateFailedNotFoundAfterUpdateForVoucherId
} from '../common/voucherMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateVoucherService {
    constructor(
        @InjectRepository(VoucherSchema) private userRepository: Repository<VoucherSchema>,
        private dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async updateVoucher(userId: number, id: number, updateVoucherDTO: UpdateVoucherDTO): Promise<any> {
        this.logger.doLog(`${updateVoucherServiceCalledForVoucherId} ${id} by userId: ${userId}`, 'info');

        const updatedBy = userId;
        const values = [
            updateVoucherDTO.amount,
            updateVoucherDTO.voucherCode,
            updateVoucherDTO.validityFrom,
            updateVoucherDTO.validityTo,
            updateVoucherDTO.vendorId,
            updateVoucherDTO.customerId,
            updatedBy,
            id
        ];
        const query = `UPDATE vouchers 
        SET 
            amount = ?, 
            voucherCode = ?, 
            validityFrom = ?, 
            validityTo = ?, 
            vendorId = ?, 
            customerId = ?, 
            updatedBy = ?, 
            updatedAt = NOW()
        WHERE id = ?;`;

        try {
            const result = await this.dataSource.query(query, values);

            if (result.affectedRows > 0) {
                const updatedVoucher = await this.dataSource.query(
                    'SELECT * FROM vouchers WHERE id = ?',
                    [id]
                );

                if (updatedVoucher.length > 0) {
                    this.logger.doLog(`${voucherUpdatedSuccessfullyForVoucherId} ${id} by userId: ${userId}`, 'success');
                    return {
                        status: true,
                        message: voucherUpdatedSuccessfully,
                        data: updatedVoucher[0]
                    };
                } else {
                    this.logger.doLog(`${voucherUpdateFailedNotFoundAfterUpdateForVoucherId} ${id}`, 'warn');
                    return {
                        status: false,
                        message: anErrorOccurredWhileUpdatingTheVoucher,
                        data: null
                    };
                }
            } else {
                this.logger.doLog(`${voucherUpdateFailedNoRowsAffectedForVoucherId} ${id}`, 'warn');
                return {
                    status: false,
                    message: anErrorOccurredWhileUpdatingTheVoucher,
                    data: null
                };
            }
        } catch (error) {
            this.logger.doLog(`${errorUpdatingVoucherId} ${id} by userId: ${userId}, error: ${error.message}`, 'error');
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingTheVoucher,
                error: error.message
            };
        }
    }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { DataSource, Repository } from "typeorm";
import {
    anErrorOccurredWhileUpdatingTheVoucher,
    voucherCodeIsAlreadyExist,
    voucherUpdatedSuccessfully
} from '../common/voucherMessage';

@Injectable()
export class UpdateVoucherService {
    constructor(
        @InjectRepository(VoucherSchema) private userRepository: Repository<VoucherSchema>,
        private dataSource: DataSource,
    ) { }

    async updateVoucher(userId: number, id: number, updateVoucherDTO: UpdateVoucherDTO): Promise<any> {
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
                    return {
                        status: true,
                        message: voucherUpdatedSuccessfully,
                        data: updatedVoucher[0]
                    };
                } else {
                    return {
                        status: false,
                        message: anErrorOccurredWhileUpdatingTheVoucher,
                        data: null
                    };
                }
            } else {
                return {
                    status: false,
                    message: anErrorOccurredWhileUpdatingTheVoucher,
                    data: null
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingTheVoucher,
                error: error.message
            };
        }
    }
}

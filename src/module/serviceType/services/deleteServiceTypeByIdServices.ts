import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeDeletionError,
    serviceTypeDeletedSuccessfully,
    servicetTypesNotFoundOrAlreadyDeleted
} from '../common/serviceTypeMessage';

@Injectable()
export class DeleteServiceTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async deleteServiceTypeById(id: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                `DELETE FROM servicetypes WHERE id = ?`,
                [id]
            );
            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            return {
                message: serviceTypeDeletedSuccessfully,
                status: true,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeDeletionError,
                error: error.message,
            };
        }
    }
}

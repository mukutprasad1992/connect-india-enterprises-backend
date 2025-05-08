import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileDeletingServiceSubType,
    serviceSubTypeNotFound,
    serviceSubTypeDeletedSuccessfully
} from '../common/serviceSubTypeMessage';

@Injectable()
export class DeleteServiceSubTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async deleteServiceSubTypeById(serviceSubTypeId: number): Promise<any> {
        try {
            const existingServiceSubType = await this.dataSource.query(
                'SELECT id FROM serviceSubTypes WHERE id = ?;',
                [serviceSubTypeId]
            );

            if (!existingServiceSubType.length) {
                return {
                    status: false,
                    message: serviceSubTypeNotFound,
                    data: null,
                };
            }

            await this.dataSource.query(
                'DELETE FROM serviceSubTypes WHERE id = ?;',
                [serviceSubTypeId]
            );

            return {
                status: true,
                message: serviceSubTypeDeletedSuccessfully,
                data: { serviceSubTypeId },
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileDeletingServiceSubType,
                error: error.message,
                data: null,
            };
        }
    }
}

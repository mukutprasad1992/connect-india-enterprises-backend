import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileDeletingServiceSubType,
    serviceSubTypeNotFound,
    serviceSubTypeDeletedSuccessfully,
    attemptingToDeleteServiceSubTypeWithID,
    serviceSubTypeWithID,
    notFoundCannotDelete,
    deletedSuccessfully,
    errorDeletingServiceSubTypeWithID
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class DeleteServiceSubTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async deleteServiceSubTypeById(serviceSubTypeId: number): Promise<any> {
        this.logger.doLog(
            `${attemptingToDeleteServiceSubTypeWithID} ${serviceSubTypeId}`,
            'info'
        );

        try {
            const existingServiceSubType = await this.dataSource.query(
                'SELECT id FROM serviceSubTypes WHERE id = ?;',
                [serviceSubTypeId]
            );

            if (!existingServiceSubType.length) {
                this.logger.doLog(
                    `${serviceSubTypeWithID} ${serviceSubTypeId} ${notFoundCannotDelete}`,
                    'warn'
                );
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

            this.logger.doLog(
                `${serviceSubTypeWithID} ${serviceSubTypeId} ${deletedSuccessfully}`,
                'success'
            );

            return {
                status: true,
                message: serviceSubTypeDeletedSuccessfully,
                data: { serviceSubTypeId },
            };
        } catch (error) {
            this.logger.doLog(
                `${errorDeletingServiceSubTypeWithID} ${serviceSubTypeId} — ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: anErrorOccurredWhileDeletingServiceSubType,
                error: error.message,
                data: null,
            };
        }
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    attemptingToMarkNotificationID,
    errorUpdatingNotificationID,
    failedToUpdateNotificationStatus,
    markedAsReadSuccessfully,
    notFoundOrAlreadyUpdated,
    notificationMarkedAsReadSuccessfully,
    notificationNotFoundOrAlreadyUpdated,
    tificationID
} from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateIsReadByIdService {
    constructor(
        private dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async updateIsReadById(id: number): Promise<any> {
        this.logger.doLog(`${attemptingToMarkNotificationID} ${id} as read`, 'info');

        try {
            const result = await this.dataSource.query(
                `UPDATE notifications 
                 SET isRead = 1 
                 WHERE id = ?`,
                [id]
            );

            if (result.affectedRows === 0) {
                this.logger.doLog(`${tificationID} ${id} ${notFoundOrAlreadyUpdated}`, 'warn');
                return {
                    status: false,
                    message: notificationNotFoundOrAlreadyUpdated,
                };
            } else {
                this.logger.doLog(`${tificationID} ${id} ${markedAsReadSuccessfully}`, 'success');
                return {
                    status: true,
                    message: notificationMarkedAsReadSuccessfully,
                };
            }
        } catch (error) {
            this.logger.doLog(
                `${errorUpdatingNotificationID} ${id} - ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: failedToUpdateNotificationStatus,
                error: error.message,
            };
        }
    }
}

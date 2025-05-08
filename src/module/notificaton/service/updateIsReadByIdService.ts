import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    failedToUpdateNotificationStatus,
    notificationMarkedAsReadSuccessfully,
    notificationNotFoundOrAlreadyUpdated
} from '../common/notificationMessage';

@Injectable()
export class UpdateIsReadByIdService {
    constructor(private dataSource: DataSource) { }

    async updateIsReadById(id: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                `UPDATE notifications 
                 SET isRead = 1 
                 WHERE id = ?`,
                [id]
            );

            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: notificationNotFoundOrAlreadyUpdated,
                };
            }

            return {
                status: true,
                message: notificationMarkedAsReadSuccessfully,
            };
        } catch (error) {
            return {
                status: false,
                message: failedToUpdateNotificationStatus,
                error: error.message,
            };
        }
    }
}

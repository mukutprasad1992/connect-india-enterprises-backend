import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    failedToFetchNotifications,
    notificationsFetchedSuccessfully
} from '../common/notificationMessage';

@Injectable()
export class GetAllNotificationService {
    constructor(private dataSource: DataSource) { }

    async getAllNotifications(): Promise<any> {
        try {
            const notifications = await this.dataSource.query(
                `SELECT * FROM notifications
                 WHERE isRead = 0
                 ORDER BY createdAt DESC`
            );

            return {
                status: true,
                message: notificationsFetchedSuccessfully,
                data: notifications,
            };
        } catch (error) {
            return {
                status: false,
                message: failedToFetchNotifications,
                error: error.message,
            };
        }
    }
}

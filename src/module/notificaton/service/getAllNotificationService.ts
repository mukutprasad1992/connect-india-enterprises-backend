import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    failedToFetchNotifications,
    notificationNotFound,
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
            if (notifications.length === 0) {
                return {
                    status: false,
                    message: notificationNotFound
                }
            }
            else {
                return {
                    status: true,
                    message: notificationsFetchedSuccessfully,
                    data: notifications,
                }
            }
        } catch (error) {
            return {
                status: false,
                message: failedToFetchNotifications,
                error: error.message,
            };
        }
    }
}

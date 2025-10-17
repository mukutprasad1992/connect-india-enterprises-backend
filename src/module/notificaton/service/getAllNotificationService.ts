import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    errorFetchingNotifications,
    failedToFetchNotifications,
    fetchingAllUnreadNotifications,
    notificationNotFound,
    notificationsFetchedSuccessfully,
    noUnreadNotificationsFound,
    unreadNotificationsSuccessfully
} from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllNotificationService {
    constructor(
        private dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async getAllNotifications(): Promise<any> {
        this.logger.doLog(fetchingAllUnreadNotifications, 'info');

        try {
            const notifications = await this.dataSource.query(
                `SELECT * FROM notifications
                 WHERE isRead = 0
                 ORDER BY createdAt DESC`
            );

            if (notifications.length === 0) {
                this.logger.doLog(noUnreadNotificationsFound, 'warn');
                return {
                    status: false,
                    message: notificationNotFound
                };
            } else {
                this.logger.doLog(`Fetched ${notifications.length} ${unreadNotificationsSuccessfully}`, 'success');
                return {
                    status: true,
                    message: notificationsFetchedSuccessfully,
                    data: notifications,
                };
            }
        } catch (error) {
            this.logger.doLog(`${errorFetchingNotifications} ${error.message}`, 'error');
            return {
                status: false,
                message: failedToFetchNotifications,
                error: error.message,
            };
        }
    }
}

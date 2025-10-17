import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    errorFetchingNotificationsForUserID,
    failedToFetchNotifications,
    fetchingNotificationsForUserID,
    fetchingRoleIdForUserID,
    foundForUserID,
    noNotificationsFoundForUserID,
    noRoleIdFoundForUserID,
    notificationNotFound,
    notificationsFetchedSuccessfully,
    notificationsSuccessfullyForUserID,
    userRoleId,
    userRoleNotFound,
    userRoleNotFoundForUserID
} from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllUserNotificationService {
    constructor(
        private dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async getAllNotifications(userId: number): Promise<any> {
        this.logger.doLog(`${fetchingNotificationsForUserID} ${userId}`, 'info');

        const roleId = await this.getUserRoleId(userId);
        if (roleId === null) {
            this.logger.doLog(`${userRoleNotFoundForUserID} ${userId}`, 'warn');
            return {
                status: false,
                message: userRoleNotFound,
            };
        }

        const query = `
            SELECT
                n.id,
                n.vendorId,
                n.voucherId,
                n.message,
                n.isRead,
                n.createdAt,
                u.email
            FROM
                notifications n
            JOIN
                users u ON n.userId = u.id
            WHERE
                (
                    ? = 1 AND (n.userRoleId = 2 OR n.userRoleId = 3)
                ) OR (
                    ? = 2 AND n.vendorId = ? AND n.voucherId IS NOT NULL
                ) OR (
                    ? = 3 AND n.userId = ? AND n.isUser = 1 AND n.userRoleId = 1
                )
            ORDER BY
                n.createdAt DESC
        `;

        const params = [roleId, roleId, userId, roleId, userId];

        try {
            const notifications = await this.dataSource.query(query, params);
            if (notifications.length === 0) {
                this.logger.doLog(`${noNotificationsFoundForUserID} ${userId}`, 'warn');
                return {
                    status: true,
                    message: notificationNotFound,
                };
            }

            this.logger.doLog(
                `Fetched ${notifications.length} ${notificationsSuccessfullyForUserID} ${userId}`,
                'success'
            );

            return {
                status: true,
                message: notificationsFetchedSuccessfully,
                data: notifications,
            };
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingNotificationsForUserID} ${userId} - ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: failedToFetchNotifications,
                error: error.message,
            };
        }
    }

    private async getUserRoleId(userId: number): Promise<number | null> {
        this.logger.doLog(`${fetchingRoleIdForUserID} ${userId}`, 'info');

        const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
        const result = await this.dataSource.query(query, [userId]);

        if (result.length > 0) {
            this.logger.doLog(`${userRoleId} ${result[0].roleId} ${foundForUserID} ${userId}`, 'success');
            return result[0].roleId;
        }

        this.logger.doLog(`${noRoleIdFoundForUserID} ${userId}`, 'warn');
        return null;
    }
}

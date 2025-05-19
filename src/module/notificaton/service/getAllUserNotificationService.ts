import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    failedToFetchNotifications,
    notificationNotFound,
    notificationsFetchedSuccessfully,
    userRoleNotFound
} from '../common/notificationMessage';

@Injectable()
export class GetAllUserNotificationService {
    constructor(private dataSource: DataSource) { }

    async getAllNotifications(userId: number): Promise<any> {
        const roleId = await this.getUserRoleId(userId);
        if (roleId === null) {
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
                return {
                    status: true,
                    message: notificationNotFound,
                };
            }

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

    private async getUserRoleId(userId: number): Promise<number | null> {
        const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
        const result = await this.dataSource.query(query, [userId]);
        if (result.length > 0) {
            return result[0].roleId;
        }
        return null;
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    failedToFetchNotifications,
    notificationNotFound,
    notificationsFetchedSuccessfully
} from '../common/notificationMessage';

@Injectable()
export class GetAllNotificationByUserIdService {
    constructor(private dataSource: DataSource) { }

    async getNotificationsByUserId(userId: number): Promise<any> {
        try {
            const quiry = `SELECT
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
                           n.userId = ?
                            AND n.isUser = 1
                            AND n.userRoleId = 1
                        ORDER BY
                            n.createdAt DESC`;
            const notifications = await this.dataSource.query(
                quiry, [userId]
            );
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
}

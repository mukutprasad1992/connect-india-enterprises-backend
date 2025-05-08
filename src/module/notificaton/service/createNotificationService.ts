import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationSchema } from '../notificationEntity/notificationEntity';
import { Repository, DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../notificationDTO/createNotificationDTO';
import {
    notificationCreatedSuccessfully,
    errorWhileCreatingNotification,
    notificationCreationFailed
} from '../common/notificationMessage';

@Injectable()
export class CreateNotificationService {
    constructor(
        @InjectRepository(NotificationSchema) private notificationRepo: Repository<NotificationSchema>,
        private dataSource: DataSource
    ) { }

    async createNotification(dto: CreateNotificationDTO): Promise<any> {

        const values = [
            dto.message,
            dto.userRoleId,
            dto.voucherId ?? null,
            dto.isRead ?? false,
            dto.userId,
            dto.vendorId,
            dto.isUser,
            dto.createdBy,
        ];

        const query = `
            INSERT INTO notifications 
            (message, userRoleId, voucherId, isRead, userId, vendorId, isUser, createdBy, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        try {
            const result = await this.dataSource.query(query, values);
            const notificationId = result.insertId;
            const notification = await this.dataSource.query(
                `SELECT * FROM notifications WHERE id = ? LIMIT 1`,
                [notificationId]
            );

            if (notification.length > 0) {
                return {
                    status: true,
                    message: notificationCreatedSuccessfully,
                    data: notification[0],
                };
            } else {
                return {
                    status: false,
                    message: errorWhileCreatingNotification,
                    data: null,
                };
            }
        } catch (error) {
            console.error(notificationCreationFailed, error);
            return {
                status: false,
                message: errorWhileCreatingNotification,
                error: error.message,
            };
        }
    }
}

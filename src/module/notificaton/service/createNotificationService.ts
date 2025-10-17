import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationSchema } from '../notificationEntity/notificationEntity';
import { Repository, DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../notificationDTO/createNotificationDTO';
import {
    notificationCreatedSuccessfully,
    errorWhileCreatingNotification,
    notificationCreationFailed,
    creatingNotificationForUserRoleId,
    notificationInsertedWithId,
    notificationFetchedSuccessfullyForId,
    failedToFetchNotificationAfterCreationId
} from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class CreateNotificationService {
    constructor(
        @InjectRepository(NotificationSchema) private notificationRepo: Repository<NotificationSchema>,
        private dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async createNotification(dto: CreateNotificationDTO): Promise<any> {
        this.logger.doLog(`${creatingNotificationForUserRoleId} = ${dto.userRoleId}, userId=${dto.userId}`, 'info');

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
            this.logger.doLog(`${notificationInsertedWithId} = ${notificationId}`, 'success');

            const notification = await this.dataSource.query(
                `SELECT * FROM notifications WHERE id = ? LIMIT 1`,
                [notificationId]
            );

            if (notification.length > 0) {
                this.logger.doLog(`${notificationFetchedSuccessfullyForId} = ${notificationId}`, 'success');
                return {
                    status: true,
                    message: notificationCreatedSuccessfully,
                    data: notification[0],
                };
            } else {
                this.logger.doLog(`${failedToFetchNotificationAfterCreationId} = ${notificationId}`, 'warn');
                return {
                    status: false,
                    message: errorWhileCreatingNotification,
                    data: null,
                };
            }
        } catch (error) {
            this.logger.doLog(`${notificationCreationFailed}: ${error.message}`, 'error');
            return {
                status: false,
                message: errorWhileCreatingNotification,
                error: error.message,
            };
        }
    }
}

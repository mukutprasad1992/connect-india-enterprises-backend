import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { DeletedServiceRequestNotificationService } from '../common/template/DeletedUserNotificationMessage';
import {
    serviceTypeDeletionError,
    serviceTypeDeletedSuccessfully,
    servicetTypesNotFoundOrAlreadyDeleted,
    serviceTypeDeletionMailError
} from '../common/serviceTypeMessage';

@Injectable()
export class DeleteServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
        private readonly createNotificationService: CreateNotificationService,
        private readonly deletedServiceRequestNotificationService: DeletedServiceRequestNotificationService
    ) { }

    async deleteServiceTypeById(id: number, userId: number): Promise<any> {
        try {
            const userIdQuery = `SELECT u.id AS userId, serviceSubType, u.email, s.serviceSubType
            FROM servicetypes s
            JOIN users u ON s.userId = u.id
            WHERE s.id = ?;`
            const getUserIdByServiceTypeId = await this.dataSource.query(userIdQuery, [id])

            const result = await this.dataSource.query(
                `DELETE FROM servicetypes WHERE id = ?`,
                [id]
            );
            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            const email = getUserIdByServiceTypeId[0].email;
            const serviceSubType = getUserIdByServiceTypeId[0].serviceSubType
            const serviceRequiestUserId = getUserIdByServiceTypeId[0].userId
            const message = this.deletedServiceRequestNotificationService.getMessage(serviceSubType);
            if (result) {
                const notificationPayload: CreateNotificationDTO = {
                    message: `${message}`,
                    userRoleId: 3,
                    voucherId: null,
                    isRead: false,
                    createdBy: userId,
                    updatedBy: userId,
                    userId: serviceRequiestUserId,
                    vendorId: null,
                    isUser: 1
                };
                const notification = await this.createNotificationService.createNotification(notificationPayload);
                if (!notification) {
                    return {
                        status: false,
                        message: '',
                    };
                }
            }
            const sendEmailToUser = await this.deleteServiceTypeByUserSendMailService.deleteSirviceTypeSendEmail(email, serviceSubType);
            if (!sendEmailToUser) {
                return {
                    status: false,
                    message: serviceTypeDeletionMailError,
                };
            }
            return {
                message: serviceTypeDeletedSuccessfully,
                status: true,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeDeletionError,
                error: error.message,
            };
        }
    }
}

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
            const userIdQuery = `
                 SELECT u.id AS userId, u.email, sr.serviceSubTypeId, sst.ledgerType
                FROM servicerequests sr
                JOIN users u ON sr.userId = u.id
                JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE sr.id = ?;
            `;
            const getUserIdByServiceTypeId = await this.dataSource.query(userIdQuery, [id]);

            if (!getUserIdByServiceTypeId || getUserIdByServiceTypeId.length === 0) {
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            const deleteQuery = `
              DELETE i, b, p, n, d, s
              FROM investmentdetails i
              LEFT JOIN basicdetails b ON i.basicDetailsId = b.id
              LEFT JOIN personaldetails p ON i.personalDetailsId = p.id
              LEFT JOIN nomineedetails n ON i.nomineeDetailsId = n.id
              LEFT JOIN documents d ON i.documentsId = d.id
              LEFT JOIN servicerequests s ON s.id = i.serviceRequestId
              WHERE i.serviceRequestId = ?;
            `;
            const result: any = await this.dataSource.query(deleteQuery, [id]);

            if (!result || result.affectedRows === 0) {
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            const email = getUserIdByServiceTypeId[0].email;
            const serviceSubType = getUserIdByServiceTypeId[0].ledgerType;
            const serviceRequiestUserId = getUserIdByServiceTypeId[0].userId;

            const notificationPayload: CreateNotificationDTO = {
                message: `Service Request Deleted by User`,
                userRoleId: 3,
                voucherId: null,
                isRead: false,
                createdBy: userId,
                updatedBy: userId,
                userId: serviceRequiestUserId,
                vendorId: null,
                isUser: 1,
            };
            const notification = await this.createNotificationService.createNotification(notificationPayload);
            if (!notification) {
                return {
                    status: false,
                    message: 'Notification creation failed',
                };
            }

            // Send email
            const sendEmailToUser = await this.deleteServiceTypeByUserSendMailService.deleteSirviceTypeSendEmail(
                email,
                serviceSubType
            );
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

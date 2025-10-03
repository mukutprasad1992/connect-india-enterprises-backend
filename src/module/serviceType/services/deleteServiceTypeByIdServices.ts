import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { DeletedServiceRequestNotificationService } from '../common/template/DeletedUserNotificationMessage';
import { AppLogger } from '../../../utils/common/loggerService';

import {
    serviceTypeDeletionError,
    serviceTypeDeletedSuccessfully,
    servicetTypesNotFoundOrAlreadyDeleted,
    serviceTypeDeletionMailError,
    serviceRequestDeletedByUser,
    notificationCreationFailed,
    startDeletingServiceTypeId,
    serviceTypeNotFoundOrAlreadyDeletedId,
    serviceTypeFoundForDeletionId,
    failedToDeleteServiceTypeOrAlreadyDeletedId,
    serviceTypeDeletedFromDatabaseId,
    notificationCreationFailedForDeletedServiceTypeId,
    notificationCreatedForDeletedServiceTypeId,
    failedToSendDeletionEmailTo,
    forServiceTypeId,
    deletionEmailSentTo,
    serviceTypeDeletionCompletedSuccessfullyId,
    errorDeletingServiceTypeId,
} from '../common/serviceTypeMessage';

@Injectable()
export class DeleteServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
        private readonly createNotificationService: CreateNotificationService,
        private readonly deletedServiceRequestNotificationService: DeletedServiceRequestNotificationService,
        private readonly logger: AppLogger,
    ) { }

    async deleteServiceTypeById(id: number, userId: number): Promise<any> {
        this.logger.doLog(`${startDeletingServiceTypeId}=${id} by userId=${userId}`, 'success');

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
                this.logger.doLog(`${serviceTypeNotFoundOrAlreadyDeletedId}=${id}`, 'fail');
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            this.logger.doLog(`${serviceTypeFoundForDeletionId}=${id}`, 'success');

            const deleteQuery = `
                DELETE i, b, p, n, d, s
                FROM investmentdetails i
                LEFT JOIN investmentBasicdetails b ON i.basicDetailsId = b.id
                LEFT JOIN investmentPersonaldetails p ON i.personalDetailsId = p.id
                LEFT JOIN investmentnomineedetails n ON i.nomineeDetailsId = n.id
                LEFT JOIN investmentDocuments d ON i.documentsId = d.id
                LEFT JOIN servicerequests s ON s.id = i.serviceRequestId
                WHERE i.serviceRequestId = ?;
            `;
            const result: any = await this.dataSource.query(deleteQuery, [id]);

            if (!result || result.affectedRows === 0) {
                this.logger.doLog(`${failedToDeleteServiceTypeOrAlreadyDeletedId}=${id}`, 'fail');
                return {
                    status: false,
                    message: servicetTypesNotFoundOrAlreadyDeleted,
                };
            }
            this.logger.doLog(`${serviceTypeDeletedFromDatabaseId}=${id}`, 'success');

            const email = getUserIdByServiceTypeId[0].email;
            const serviceSubType = getUserIdByServiceTypeId[0].ledgerType;
            const serviceRequestUserId = getUserIdByServiceTypeId[0].userId;

            // Create Notification
            const notificationPayload: CreateNotificationDTO = {
                message: serviceRequestDeletedByUser,
                userRoleId: 3,
                voucherId: null,
                isRead: false,
                createdBy: userId,
                updatedBy: userId,
                userId: serviceRequestUserId,
                vendorId: null,
                isUser: 1,
            };
            const notification = await this.createNotificationService.createNotification(notificationPayload);
            if (!notification) {
                this.logger.doLog(`${notificationCreationFailedForDeletedServiceTypeId}=${id}`, 'fail');
                return {
                    status: false,
                    message: notificationCreationFailed,
                };
            }
            this.logger.doLog(`${notificationCreatedForDeletedServiceTypeId}=${id}`, 'success');

            // Send email
            const sendEmailToUser = await this.deleteServiceTypeByUserSendMailService.deleteSirviceTypeSendEmail(
                email,
                serviceSubType
            );
            if (!sendEmailToUser) {
                this.logger.doLog(`${failedToSendDeletionEmailTo} ${email} ${forServiceTypeId}=${id}`, 'fail');
                return {
                    status: false,
                    message: serviceTypeDeletionMailError,
                };
            }
            this.logger.doLog(`${deletionEmailSentTo} ${email} ${forServiceTypeId}=${id} `, 'success');

            this.logger.doLog(`${serviceTypeDeletionCompletedSuccessfullyId} = ${id} `, 'success');

            return {
                message: serviceTypeDeletedSuccessfully,
                status: true,
            };
        } catch (error) {
            this.logger.doLog(`${errorDeletingServiceTypeId} = ${id}: ${error.message} `, 'fail');
            return {
                status: false,
                message: serviceTypeDeletionError,
                error: error.message,
            };
        }
    }
}

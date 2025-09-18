import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { insuranceDeletedSuccessfully, insuranceDeletionError, insuranceDeletionMailError, insuranceNotFoundOrAlreadyDeleted, notificationCreationFailed, serviceRequestDeletedByUser } from '../common/insuranceMessage';


@Injectable()
export class DeleteInsuranceByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
        private readonly createNotificationService: CreateNotificationService,
    ) { }

    async deleteInsuranceById(id: number, userId: number): Promise<any> {
        try {
            const userIdQuery = `
                 SELECT u.id AS userId, u.email, sr.serviceSubTypeId, sst.ledgerType
                FROM servicerequests sr
                JOIN users u ON sr.userId = u.id
                JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE sr.id = ?;
            `;
            const getUserIdByInsuranceId = await this.dataSource.query(userIdQuery, [id]);

            if (!getUserIdByInsuranceId || getUserIdByInsuranceId.length === 0) {
                return {
                    status: false,
                    message: insuranceNotFoundOrAlreadyDeleted,
                };
            }
            const deleteQuery = `
              DELETE i, b, p, n, d, s
              FROM insurancedetails i
              LEFT JOIN insurancebasicdetails b ON i.basicDetailsId = b.id
              LEFT JOIN insurancepersonaldetails p ON i.personalDetailsId = p.id
              LEFT JOIN insurancenomineedetails n ON i.nomineeDetailsId = n.id
              LEFT JOIN insurancedocuments d ON i.documentsId = d.id
              LEFT JOIN servicerequests s ON s.id = i.serviceRequestId
              WHERE i.serviceRequestId = ?;
            `;
            const result: any = await this.dataSource.query(deleteQuery, [id]);

            if (!result || result.affectedRows === 0) {
                return {
                    status: false,
                    message: insuranceNotFoundOrAlreadyDeleted,
                };
            }
            const email = getUserIdByInsuranceId[0].email;
            const serviceSubType = getUserIdByInsuranceId[0].ledgerType;
            const serviceRequiestUserId = getUserIdByInsuranceId[0].userId;

            const notificationPayload: CreateNotificationDTO = {
                message: serviceRequestDeletedByUser,
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
                    message: notificationCreationFailed,
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
                    message: insuranceDeletionMailError,
                };
            }

            return {
                message: insuranceDeletedSuccessfully,
                status: true,
            };
        } catch (error) {
            return {
                status: false,
                message: insuranceDeletionError,
                error: error.message,
            };
        }
    }
}

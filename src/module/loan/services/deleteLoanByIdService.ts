import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    loanDeletedSuccessfully,
    loanDeletionError,
    loanDeletionMailError,
    loanNotFoundOrAlreadyDeleted,
    notificationCreationFailed,
    serviceRequestDeletedByUser
} from '../common/loanMessage';


@Injectable()
export class DeleteLoanByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
        private readonly createNotificationService: CreateNotificationService,
    ) { }

    async deleteLoanById(id: number, userId: number): Promise<any> {
        try {
            const userIdQuery = `
                 SELECT u.id AS userId, u.email, sr.serviceSubTypeId, sst.ledgerType
                FROM servicerequests sr
                JOIN users u ON sr.userId = u.id
                JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE sr.id = ?;
            `;
            const getUserIdByloanId = await this.dataSource.query(userIdQuery, [id]);

            if (!getUserIdByloanId || getUserIdByloanId.length === 0) {
                return {
                    status: false,
                    message: loanNotFoundOrAlreadyDeleted,
                };
            }
            const deleteQuery = `
              DELETE l, c, p, e, r, d , s
              FROM loandetails l
              LEFT JOIN loanpersonaldetails p ON l.personalDetailsId = p.id
              LEFT JOIN loancontactdetails c ON l.contactDetailsId = c.id
              LEFT JOIN loanemploymentdetails e ON l.employmentDetailsId = e.id
              LEFT JOIN loanreferencedetails r ON l.referenceDetailsId = r.id
              LEFT JOIN insurancedocuments d ON l.documentsId = d.id
              LEFT JOIN servicerequests s ON s.id = l.serviceRequestId
              WHERE l.serviceRequestId = ?;
            `;
            const result: any = await this.dataSource.query(deleteQuery, [id]);

            if (!result || result.affectedRows === 0) {
                return {
                    status: false,
                    message: loanNotFoundOrAlreadyDeleted,
                };
            }
            const email = getUserIdByloanId[0].email;
            const serviceSubType = getUserIdByloanId[0].ledgerType;
            const serviceRequiestUserId = getUserIdByloanId[0].userId;

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
                    message: loanDeletionMailError,
                };
            }

            return {
                message: loanDeletedSuccessfully,
                status: true,
            };
        } catch (error) {
            return {
                status: false,
                message: loanDeletionError,
                error: error.message,
            };
        }
    }
}

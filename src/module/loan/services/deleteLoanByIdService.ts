import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  attemptingToDeleteLoanWithID,
  deletionEmailSentTo,
  failedToSendDeletionEmailTo,
  loanAndRelatedDataDeletedSuccessfullyForServiceRequestId,
  loanDeletedSuccessfully,
  loanDeletionError,
  loanDeletionErrorForServiceRequestId,
  loanDeletionMailError,
  loanDeletionProcessCompletedSuccessfullyForServiceRequestId,
  loanFoundForDeletionServiceRequestId,
  loanNotFoundOrAlreadyDeleted,
  loanNotFoundOrAlreadyDeletedForServiceRequestId,
  noRowsDeletedForServiceRequestId,
  notificationCreatedSuccessfullyForserviceRequestId,
  notificationCreationFailed,
  notificationCreationFailedForServiceRequestId,
  serviceRequestDeletedByUser,
} from '../common/loanMessage';

@Injectable()
export class DeleteLoanByIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
    private readonly createNotificationService: CreateNotificationService,
    private readonly logger: AppLogger,
  ) {}

  async deleteLoanById(id: number, userId: number): Promise<any> {
    this.logger.doLog(
      `${attemptingToDeleteLoanWithID} ${id} by userId: ${userId}`,
      'info',
    );

    try {
      // Fetch user info and serviceSubType
      const userIdQuery = `
                 SELECT u.id AS userId, u.email, sr.serviceSubTypeId, sst.ledgerType
                 FROM servicerequests sr
                 JOIN users u ON sr.userId = u.id
                 JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                 WHERE sr.id = ?;
            `;
      const getUserIdByLoanId = await this.dataSource.query(userIdQuery, [id]);
      if (!getUserIdByLoanId || getUserIdByLoanId.length === 0) {
        this.logger.doLog(
          `${loanNotFoundOrAlreadyDeletedForServiceRequestId} ${id}`,
          'warn',
        );
        return { status: false, message: loanNotFoundOrAlreadyDeleted };
      }
      this.logger.doLog(
        `${loanFoundForDeletionServiceRequestId} ${id}`,
        'info',
      );

      // Delete loan and related details
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
        this.logger.doLog(`${noRowsDeletedForServiceRequestId} ${id}`, 'warn');
        return { status: false, message: loanNotFoundOrAlreadyDeleted };
      }
      this.logger.doLog(
        `${loanAndRelatedDataDeletedSuccessfullyForServiceRequestId} ${id}`,
        'success',
      );

      const email = getUserIdByLoanId[0].email;
      const serviceSubType = getUserIdByLoanId[0].ledgerType;
      const serviceRequestUserId = getUserIdByLoanId[0].userId;

      // Create notification
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
      const notification =
        await this.createNotificationService.createNotification(
          notificationPayload,
        );
      if (!notification) {
        this.logger.doLog(
          `${notificationCreationFailedForServiceRequestId} ${id}`,
          'warn',
        );
        return { status: false, message: notificationCreationFailed };
      }
      this.logger.doLog(
        `${notificationCreatedSuccessfullyForserviceRequestId} ${id}`,
        'success',
      );

      // Send email to user
      const sendEmailToUser =
        await this.deleteServiceTypeByUserSendMailService.deleteSirviceTypeSendEmail(
          email,
          serviceSubType,
        );
      if (!sendEmailToUser) {
        this.logger.doLog(`${failedToSendDeletionEmailTo} ${email}`, 'error');
        return { status: false, message: loanDeletionMailError };
      }
      this.logger.doLog(
        `${deletionEmailSentTo} ${email} successfully`,
        'success',
      );

      this.logger.doLog(
        `${loanDeletionProcessCompletedSuccessfullyForServiceRequestId} ${id}`,
        'success',
      );

      return { message: loanDeletedSuccessfully, status: true };
    } catch (error: any) {
      this.logger.doLog(
        `${loanDeletionErrorForServiceRequestId} ${id}: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: loanDeletionError,
        error: error.message,
      };
    }
  }
}

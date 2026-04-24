import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { DeleteServiceTypeByUserSendMailService } from '../../../utils/mailer/deleteServiceTypeByUserSendMail';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
  insuranceDeletedSuccessfully,
  insuranceDeletionError,
  insuranceDeletionMailError,
  insuranceNotFoundOrAlreadyDeleted,
  notificationCreationFailed,
  serviceRequestDeletedByUser,
  deleteInsuranceServiceStartDeletingInsurance,
  deleteInsuranceServiceInsuranceNotFound,
  deleteInsuranceServiceDeletedSuccessfully,
  deleteInsuranceServiceNotificationFailed,
  deleteInsuranceServiceMailFailed,
  deleteInsuranceServiceUnexpectedError,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class DeleteInsuranceByIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly deleteServiceTypeByUserSendMailService: DeleteServiceTypeByUserSendMailService,
    private readonly createNotificationService: CreateNotificationService,
    private readonly logger: AppLogger,
  ) {}

  async deleteInsuranceById(id: number, userId: number): Promise<any> {
    this.logger.doLog(
      `${deleteInsuranceServiceStartDeletingInsurance} (insuranceId: ${id}, userId: ${userId})`,
      'info',
    );

    try {
      // 🔹 Step 1: Validate Insurance Record
      const userIdQuery = `
                SELECT u.id AS userId, u.email, sr.serviceSubTypeId, sst.ledgerType
                FROM servicerequests sr
                JOIN users u ON sr.userId = u.id
                JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE sr.id = ?;
            `;
      const getUserIdByInsuranceId = await this.dataSource.query(userIdQuery, [
        id,
      ]);

      if (!getUserIdByInsuranceId || getUserIdByInsuranceId.length === 0) {
        this.logger.doLog(
          `${deleteInsuranceServiceInsuranceNotFound} (insuranceId: ${id})`,
          'warn',
        );
        return {
          status: false,
          message: insuranceNotFoundOrAlreadyDeleted,
        };
      }

      // 🔹 Step 2: Perform Cascading Delete Across Related Tables
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
        this.logger.doLog(
          `${deleteInsuranceServiceInsuranceNotFound} (insuranceId: ${id})`,
          'warn',
        );
        return {
          status: false,
          message: insuranceNotFoundOrAlreadyDeleted,
        };
      }

      // 🔹 Step 3: Prepare notification + email details
      const {
        email,
        ledgerType,
        userId: serviceRequestUserId,
      } = getUserIdByInsuranceId[0];

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

      // 🔹 Step 4: Create Notification
      const notification =
        await this.createNotificationService.createNotification(
          notificationPayload,
        );
      if (!notification) {
        this.logger.doLog(
          `${deleteInsuranceServiceNotificationFailed} (insuranceId: ${id}, userId: ${userId})`,
          'warn',
        );
        return {
          status: false,
          message: notificationCreationFailed,
        };
      }

      // 🔹 Step 5: Send Email
      const sendEmailToUser =
        await this.deleteServiceTypeByUserSendMailService.deleteSirviceTypeSendEmail(
          email,
          ledgerType,
        );

      if (!sendEmailToUser) {
        this.logger.doLog(
          `${deleteInsuranceServiceMailFailed} (insuranceId: ${id}, userId: ${userId})`,
          'warn',
        );
        return {
          status: false,
          message: insuranceDeletionMailError,
        };
      }

      // 🔹 Step 6: Success Response
      this.logger.doLog(
        `${deleteInsuranceServiceDeletedSuccessfully} (insuranceId: ${id}, userId: ${userId})`,
        'success',
      );

      return {
        status: true,
        message: insuranceDeletedSuccessfully,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${deleteInsuranceServiceUnexpectedError} (insuranceId: ${id}, userId: ${userId}): ${error.message}`,
        'error',
      );

      return {
        status: false,
        message: insuranceDeletionError,
        error: error.message,
      };
    }
  }
}

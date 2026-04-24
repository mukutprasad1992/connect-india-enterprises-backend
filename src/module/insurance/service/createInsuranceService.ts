import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateInsuranceDTO } from '../insuranceDTO/createInsuranceDTO';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { InsuranceMailService } from 'src/utils/mailer/insuranceMailer';
import {
  userNotFound,
  failedToRetrieveTheIDOfTheLastInsertedInsurance,
  yourInsuranceRequestHasBeenCreatedSuccessfully,
  invalidServiceSubType,
  failedToCreateInsuranceRequest,
  failedToCreateBasicDetails,
  ANew,
  createdSuccessfully,
  insuranceHasBeenCreatedBy,
  AndRequiresYourAttention,
  insuranceCreationError,
  createInsuranceServiceUserNotFound,
  createInsuranceServiceStartCreatingInsuranceRequest,
  createInsuranceServiceInvalidServiceSubType,
  createInsuranceServiceFailedToCreateServiceRequest,
  createInsuranceServiceFailedToCreateInsuranceBasicDetails,
  createInsuranceServiceFailedToRetrieveIDOfLastInsertedInsurance,
  createInsuranceServiceInsuranceCreatedSuccessfully,
  createInsuranceServiceNotificationCreationFailed,
  createInsuranceServiceNotificationSentSuccessfully,
  createInsuranceServiceUnexpectedError,
} from '../common/insuranceMessage';
import { notificationCreationFailed } from '../../notificaton/common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class CreateInsuranceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly createNotificationService: CreateNotificationService,
    private readonly insuranceMailService: InsuranceMailService,
    private readonly logger: AppLogger,
  ) {}

  async getUserById(userId: number): Promise<any | null> {
    const user = await this.dataSource.query(
      'SELECT * FROM users WHERE id = ?',
      [userId],
    );
    return user.length > 0 ? user[0] : null;
  }

  async getServiceSubTypeId(
    serviceSubType: string,
  ): Promise<{ id: number } | null> {
    const result = await this.dataSource.query(
      'SELECT id FROM servicesubtypes WHERE ledgerType = ?',
      [serviceSubType],
    );
    return result.length > 0 ? { id: result[0].id } : null;
  }

  private async insertAndReturnId(
    query: string,
    params: any[],
  ): Promise<number | null> {
    const result: any = await this.dataSource.query(query, params);
    return result && result.insertId ? result.insertId : null;
  }

  async addServiceRequest(
    userId: number,
    serviceId: number,
    serviceSubTypeId: number,
  ): Promise<number | null> {
    const query = `
          INSERT INTO servicerequests (userId, serviceId, serviceSubTypeId, createdBy, createdAt)
          VALUES (?, ?, ?, ?, NOW())
        `;
    return this.insertAndReturnId(query, [
      userId,
      serviceId,
      serviceSubTypeId,
      userId,
    ]);
  }

  async addBasicDetails(
    userId: number,
    aadharNumber: string,
    panNumber: string,
  ): Promise<number | null> {
    const query = `
          INSERT INTO insurancebasicdetails (aadharNumber, panNumber, createdBy, createdAt)
          VALUES (?, ?, ?, NOW())
        `;
    return this.insertAndReturnId(query, [aadharNumber, panNumber, userId]);
  }

  async createInsurance(userId: number, dto: CreateInsuranceDTO): Promise<any> {
    this.logger.doLog(
      `${createInsuranceServiceStartCreatingInsuranceRequest} (userId: ${userId}, serviceSubType: ${dto.serviceSubType})`,
      'info',
    );

    try {
      const user = await this.getUserById(userId);
      if (!user) {
        this.logger.doLog(
          `${createInsuranceServiceUserNotFound} (userId: ${userId})`,
          'warn',
        );
        return { status: false, message: userNotFound };
      }

      const serviceSubType = await this.getServiceSubTypeId(dto.serviceSubType);
      if (!serviceSubType) {
        this.logger.doLog(
          `${createInsuranceServiceInvalidServiceSubType} ${dto.serviceSubType} (userId: ${userId})`,
          'warn',
        );
        return {
          status: false,
          message: `${invalidServiceSubType} : ${dto.serviceSubType}`,
        };
      }

      const serviceRequestId = await this.addServiceRequest(
        userId,
        dto.serviceId,
        serviceSubType.id,
      );
      if (!serviceRequestId) {
        this.logger.doLog(
          `${createInsuranceServiceFailedToCreateServiceRequest} (userId: ${userId})`,
          'error',
        );
        return { status: false, message: failedToCreateInsuranceRequest };
      }

      const insuranceBasicDetailsId = await this.addBasicDetails(
        userId,
        dto.aadharNumber,
        dto.panNumber,
      );
      if (!insuranceBasicDetailsId) {
        this.logger.doLog(
          `${createInsuranceServiceFailedToCreateInsuranceBasicDetails} (userId: ${userId})`,
          'error',
        );
        return { status: false, message: failedToCreateBasicDetails };
      }

      const invQuery = `
              INSERT INTO insurancedetails
              (basicDetailsId, serviceRequestId, status, activeSteps, createdBy, createdAt)
              VALUES (?, ?, ?, ?, ?, NOW())
            `;
      const insuranceId = await this.insertAndReturnId(invQuery, [
        insuranceBasicDetailsId,
        serviceRequestId,
        dto.status,
        dto.activeSteps,
        userId,
      ]);

      if (!insuranceId) {
        this.logger.doLog(
          `${createInsuranceServiceFailedToRetrieveIDOfLastInsertedInsurance} (userId: ${userId})`,
          'error',
        );
        return {
          status: false,
          message: failedToRetrieveTheIDOfTheLastInsertedInsurance,
        };
      }

      this.logger.doLog(
        `${createInsuranceServiceInsuranceCreatedSuccessfully} (insuranceId: ${insuranceId}, userId: ${userId})`,
        'success',
      );

      const joinedData = await this.dataSource.query(
        `
               SELECT
                    sr.id as id,
                    sr.serviceId, sr.serviceSubTypeId,
                   bd.id as insuranceBasicDetailsId, bd.aadharNumber, bd.panNumber,
                   ind.id as insuranceId, ind.status, ind.activeSteps, ind.createdAt as insuranceCreatedAt,
                   sst.ledgerType as serviceSubTypeName
                 FROM insurancedetails ind
                 INNER JOIN insurancebasicdetails bd ON ind.basicDetailsId = bd.id
                 INNER JOIN servicerequests sr ON ind.serviceRequestId = sr.id
                 INNER JOIN users u ON sr.userId = u.id
                 INNER JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                 WHERE ind.id = ?
                 `,
        [insuranceId],
      );

      const finalData = joinedData[0];

      await this.insuranceMailService.emailCreateInsuranceTemplates(
        user.email,
        user.firstName,
        user.lastName,
        dto.status,
        dto.serviceSubType,
      );

      const formattedSubType = dto.serviceSubType.replace(
        /([a-z])([A-Z])/g,
        '$1 $2',
      );
      const notificationPayload: CreateNotificationDTO = {
        message: `${ANew} <strong>${formattedSubType}</strong> ${insuranceHasBeenCreatedBy}  <strong>${user?.firstName} ${user?.lastName}</strong> ${AndRequiresYourAttention}`,
        userRoleId: 3,
        voucherId: null,
        isRead: false,
        createdBy: userId,
        updatedBy: userId,
        userId: user.id,
        vendorId: null,
        isUser: 1,
      };

      const notification =
        await this.createNotificationService.createNotification(
          notificationPayload,
        );
      if (!notification) {
        this.logger.doLog(
          `${createInsuranceServiceNotificationCreationFailed} (insuranceId: ${insuranceId}, userId: ${userId})`,
          'warn',
        );
        return { status: false, message: notificationCreationFailed };
      }

      this.logger.doLog(
        `${createInsuranceServiceNotificationSentSuccessfully} (insuranceId: ${insuranceId}, userId: ${userId})`,
        'success',
      );

      const service =
        dto.activeSteps === 'basicDetails'
          ? 'Basic Details'
          : 'Insurance Details';
      return {
        status: true,
        message: `${service} ${createdSuccessfully}`,
        data: finalData,
        notification: {
          message: yourInsuranceRequestHasBeenCreatedSuccessfully,
        },
      };
    } catch (error: any) {
      this.logger.doLog(
        `${createInsuranceServiceUnexpectedError} (userId: ${userId}): ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: insuranceCreationError,
        error: error.message,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource, Timestamp } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
  insuranceUpdateError,
  reviewStepCompletedSuccessfully,
  failedToUpdateBasicDetails,
  failedToSavePersonalDetails,
  failedToSaveNomineeDetails,
  failedToSaveDocuments,
  updatedSuccessfully,
  updateInsuranceServiceStartUpdating,
  updateInsuranceServiceInvalidStep,
  updateInsuranceServiceUpdatedSuccessfully,
  updateInsuranceServiceUnexpectedError,
  insuranceRequestNotFound,
} from '../common/insuranceMessage';
import { InsuranceSchema } from '../insuranceEntity/insuranceEntity';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateInsuranceByIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly createNotificationService: CreateNotificationService,
    private readonly logger: AppLogger,
  ) {}

  // 🔹 Fetch existing insurance request
  async getServiceRequestById(
    serviceRequestId: number,
  ): Promise<InsuranceSchema | null> {
    const serviceType = await this.dataSource.query(
      `SELECT * FROM insurancedetails WHERE serviceRequestId = ?;`,
      [serviceRequestId],
    );
    return serviceType.length > 0 ? serviceType[0] : null;
  }

  // 🔹 Common helper for insert + return ID
  private async insertAndReturnId(
    query: string,
    params: any[],
  ): Promise<number | null> {
    const result: any = await this.dataSource.query(query, params);
    return result && result.insertId ? result.insertId : null;
  }

  // 🔹 Update Basic Details
  async updateBasicDetails(
    aadharNumber: string,
    panNumber: string,
    userId: number,
    basicDetailsId: number,
  ): Promise<boolean> {
    const query = `
            UPDATE insurancebasicdetails
            SET aadharNumber = ?, panNumber = ?, updatedBy = ?, updatedAt = NOW()
            WHERE id = ?
        `;
    const result: any = await this.dataSource.query(query, [
      aadharNumber,
      panNumber,
      userId,
      basicDetailsId,
    ]);
    return result.affectedRows > 0;
  }

  // 🔹 Save Personal Details (Insert / Update)
  async savePersonalDetails(
    id: number | null,
    motherName: string,
    heightCM: string,
    placeOfBirth: { city: string; state: string },
    weightKG: number,
    income: string,
    occupation: string,
    smoker: string,
    alcohol: string,
    userId: number,
  ): Promise<number | null> {
    const query = `
            INSERT INTO insurancepersonaldetails
                (id, motherName, heightCM, placeOfBirth, weightKG, income, occupation, smoker, alcohol, createdBy, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                motherName = VALUES(motherName),
                heightCM = VALUES(heightCM),
                placeOfBirth = VALUES(placeOfBirth),
                weightKG = VALUES(weightKG),
                income = VALUES(income),
                occupation = VALUES(occupation),
                smoker = VALUES(smoker),
                alcohol = VALUES(alcohol),
                updatedBy = VALUES(createdBy),
                updatedAt = NOW()
        `;
    const result: any = await this.dataSource.query(query, [
      id,
      motherName,
      heightCM,
      JSON.stringify(placeOfBirth),
      weightKG,
      income,
      occupation,
      smoker,
      alcohol,
      userId,
    ]);
    if (result.insertId && result.insertId !== 0) return result.insertId;
    return id;
  }

  // 🔹 Save Nominee Details (Insert / Update)
  async saveNomineeDetails(
    id: number | null,
    nomineeName: string,
    nomineeDOB: Timestamp,
    nomineeRelation: string,
    userId: number,
  ): Promise<number | null> {
    if (id) {
      const query = `
                UPDATE insurancenomineedetails
                SET nomineeName = ?, nomineeDOB = ?, nomineeRelation = ?, updatedBy = ?, updatedAt = NOW()
                WHERE id = ?
            `;
      const result: any = await this.dataSource.query(query, [
        nomineeName,
        nomineeDOB,
        nomineeRelation,
        userId,
        id,
      ]);
      return result.affectedRows > 0 ? id : null;
    } else {
      const query = `
                INSERT INTO insurancenomineedetails
                    (nomineeName, nomineeDOB, nomineeRelation, createdBy, createdAt)
                VALUES (?, ?, ?, ?, NOW())
            `;
      const result: any = await this.dataSource.query(query, [
        nomineeName,
        nomineeDOB,
        nomineeRelation,
        userId,
      ]);
      return result.insertId || null;
    }
  }

  // 🔹 Save Documents (Insert / Update)
  async saveDocuments(
    id: number | null,
    aadharCardFileKey: string,
    panCardFileKey: string,
    bankProofFileKey: string,
    salarySlipsFileKey: string,
    itrDocumentsFileKey: string,
    userId: number,
  ): Promise<number | null> {
    if (id) {
      const query = `
                UPDATE insurancedocuments
                SET aadharCardFileKey = ?, panCardFileKey = ?, bankProofFileKey = ?, salarySlipsFileKey = ?, itrDocumentsFileKey = ?, updatedBy = ?, updatedAt = NOW()
                WHERE id = ?
            `;
      const result: any = await this.dataSource.query(query, [
        aadharCardFileKey,
        panCardFileKey,
        bankProofFileKey,
        salarySlipsFileKey,
        itrDocumentsFileKey,
        userId,
        id,
      ]);
      return result.affectedRows > 0 ? id : null;
    } else {
      const query = `
                INSERT INTO insurancedocuments
                    (aadharCardFileKey, panCardFileKey, bankProofFileKey, salarySlipsFileKey, itrDocumentsFileKey, createdBy, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
      const result: any = await this.dataSource.query(query, [
        aadharCardFileKey,
        panCardFileKey,
        bankProofFileKey,
        salarySlipsFileKey,
        itrDocumentsFileKey,
        userId,
      ]);
      return result.insertId || null;
    }
  }

  // 🔹 Main Function: Update Insurance by Service ID
  async updateInsuranceById(
    serviceRequestId: number,
    userId: number,
    updateData: any,
  ): Promise<any> {
    this.logger.doLog(
      `${updateInsuranceServiceStartUpdating} (serviceRequestId: ${serviceRequestId}, userId: ${userId})`,
      'info',
    );

    try {
      const existing = await this.getServiceRequestById(serviceRequestId);
      if (!existing) {
        return { status: false, message: insuranceRequestNotFound };
      }

      const activeSteps = updateData.activeSteps;
      const currentActiveSteps = existing.activeSteps;

      const stepOrder: Record<string, number> = {
        basicDetails: 1,
        personalDetails: 2,
        nomineeDetails: 3,
        documents: 4,
        review: 5,
      };

      if (!stepOrder[activeSteps]) {
        this.logger.doLog(updateInsuranceServiceInvalidStep, 'warn');
        return { status: false, message: updateInsuranceServiceInvalidStep };
      }

      const finalActiveStep =
        stepOrder[activeSteps] > stepOrder[currentActiveSteps]
          ? activeSteps
          : currentActiveSteps;

      let detailId: number | null = null;

      // 🧩 Handle Each Step Separately
      if (activeSteps === 'basicDetails') {
        const updated = await this.updateBasicDetails(
          updateData.aadharNumber,
          updateData.panNumber,
          userId,
          existing.basicDetailsId,
        );
        if (!updated)
          return { status: false, message: failedToUpdateBasicDetails };
        detailId = existing.basicDetailsId;
      } else if (activeSteps === 'personalDetails') {
        detailId = await this.savePersonalDetails(
          existing.personalDetailsId || null,
          updateData.motherName,
          updateData.heightCM,
          updateData.placeOfBirth,
          updateData.weightKG,
          updateData.income,
          updateData.occupation,
          updateData.smoker,
          updateData.alcohol,
          userId,
        );
        if (!detailId)
          return { status: false, message: failedToSavePersonalDetails };
      } else if (activeSteps === 'nomineeDetails') {
        detailId = await this.saveNomineeDetails(
          existing.nomineeDetailsId || null,
          updateData.nomineeName,
          updateData.nomineeDOB,
          updateData.nomineeRelation,
          userId,
        );
        if (!detailId)
          return { status: false, message: failedToSaveNomineeDetails };
      } else if (activeSteps === 'documents') {
        detailId = await this.saveDocuments(
          existing.documentsId || null,
          updateData.aadharCardFileKey,
          updateData.panCardFileKey,
          updateData.bankProofFileKey,
          updateData.salarySlipsFileKey,
          updateData.itrDocumentsFileKey,
          userId,
        );
        if (!detailId) return { status: false, message: failedToSaveDocuments };
      } else if (activeSteps === 'review') {
        await this.dataSource.query(
          `UPDATE insurancedetails SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW() WHERE serviceRequestId = ?`,
          [updateData.submit, activeSteps, userId, serviceRequestId],
        );
        return { status: true, message: reviewStepCompletedSuccessfully };
      }

      // 🔹 Update main insurance table with latest step
      if (detailId) {
        await this.dataSource.query(
          `UPDATE insurancedetails SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW() WHERE serviceRequestId = ?`,
          [detailId, finalActiveStep, userId, serviceRequestId],
        );
      }

      // 🔹 Send Notification
      const formattedStep = activeSteps
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase());
      const notificationPayload: CreateNotificationDTO = {
        message: `${formattedStep} ${updatedSuccessfully}`,
        userRoleId: 3,
        voucherId: null,
        isRead: false,
        createdBy: userId,
        updatedBy: userId,
        userId,
        vendorId: null,
        isUser: 1,
      };

      const notification =
        await this.createNotificationService.createNotification(
          notificationPayload,
        );
      if (!notification) {
        this.logger.doLog(notificationCreationFailed, 'warn');
      }

      this.logger.doLog(
        `${updateInsuranceServiceUpdatedSuccessfully} (serviceRequestId: ${serviceRequestId}, userId: ${userId})`,
        'success',
      );

      return {
        status: true,
        message: `${formattedStep} ${updatedSuccessfully}`,
        data: existing,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${updateInsuranceServiceUnexpectedError} (serviceRequestId: ${serviceRequestId}, userId: ${userId}): ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: insuranceUpdateError,
        error: error.message,
      };
    }
  }
}

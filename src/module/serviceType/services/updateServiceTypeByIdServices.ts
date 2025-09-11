import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    reviewStepCompletedSuccessfully,
    failedToUpdateBasicDetails,
    failedToSavePersonalDetails,
    failedToSaveNomineeDetails,
    failedToSaveDocuments,
    UpdatedSuccessfully
} from '../common/serviceTypeMessage';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UpdatedServiceMessageService } from '../common/template/serviceTypeUpdateNotificationMessageTemplate';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { UpdateServiceTypeByUserMailService } from 'src/utils/mailer/updateServiceTypeByUserMailService';
@Injectable()
export class UpdateServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly updatedServiceMessageService: UpdatedServiceMessageService,
        private readonly updateServiceTypeByUserMailService: UpdateServiceTypeByUserMailService,
    ) { }

    async getServiceRequestById(serviceRequestId: number): Promise<ServiceTypeSchema | null> {
        const serviceType = await this.dataSource.query(
            `SELECT * FROM investmentdetails i WHERE i.serviceRequestId = ?; `,
            [serviceRequestId]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
        const result: any = await this.dataSource.query(query, params);
        return result && result.insertId ? result.insertId : null;
    }
    async updateBasicDetails(
        aadharNumber: string,
        panNumber: string,
        userId: number,
        basicDetailsId: number,
    ): Promise<boolean> {
        const query = `
      UPDATE basicdetails
      SET aadharNumber = ?, 
          panNumber = ?, 
          updatedBy = ?, 
          updatedAt = NOW()
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

    async savePersonalDetails(
        id: number | null,
        email: string,
        mobile: string,
        placeOfBirth: { city: string; state: string },
        income: string,
        occupation: string,
        userId: number
    ): Promise<number | null> {
        const query = `
        INSERT INTO personaldetails 
            (id, email, mobile, placeOfBirth, income, occupation, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            mobile = VALUES(mobile),
            placeOfBirth = VALUES(placeOfBirth),
            income = VALUES(income),
            occupation = VALUES(occupation),
            updatedBy = VALUES(createdBy),
            updatedAt = NOW()
    `;

        const result: any = await this.dataSource.query(query, [
            id,
            email,
            mobile,
            JSON.stringify(placeOfBirth),
            income,
            occupation,
            userId
        ]);
        if (result.insertId && result.insertId !== 0) {
            return result.insertId;
        }
        return id;
    }

    async saveNomineeDetails(
        id: number | null,
        nomineeIdType: string,
        nomineeId: string,
        nomineeMobile: string,
        nomineeRelation: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE nomineedetails
          SET nomineeIdType = ?,
              nomineeId = ?,
              nomineeMobile = ?,
              nomineeRelation = ?,
              updatedBy = ?, 
              updatedAt = NOW()
          WHERE id = ?
        `;

            const result: any = await this.dataSource.query(query, [
                nomineeIdType,
                nomineeId,
                nomineeMobile,
                nomineeRelation,
                userId,
                id,
            ]);

            return result.affectedRows > 0 ? id : null;
        } else {
            const query = `
          INSERT INTO nomineedetails
              (nomineeIdType, nomineeId, nomineeMobile, nomineeRelation, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, NOW())
        `;

            const result: any = await this.dataSource.query(query, [
                nomineeIdType,
                nomineeId,
                nomineeMobile,
                nomineeRelation,
                userId,
            ]);

            return result.insertId || null;
        }
    }

    async saveDocuments(
        id: number | null,
        aadharCardFileKey: string,
        panCardFileKey: string,
        bankProofFileKey: string,
        salarySlipsFileKey: string,
        itrDocumentsFileKey: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE documents
          SET aadharCardFileKey = ?,
              panCardFileKey = ?,
              bankProofFileKey = ?,
              salarySlipsFileKey = ?,
              itrDocumentsFileKey = ?,
              updatedBy = ?, 
              updatedAt = NOW()
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
          INSERT INTO documents
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
    async updateServiceTypeById(
        serviceRequestId: number,
        userId: number,
        updateData: any
    ): Promise<any> {
        try {
            let serviceRequestExists = await this.getServiceRequestById(serviceRequestId);
            const activeSteps = updateData.activeSteps;
            const currentActiveSteps = serviceRequestExists.activeSteps;
            let detailId: number | null = null;

            // map for step order
            const stepOrder: { [key: string]: number } = {
                basicDetails: 1,
                personalDetails: 2,
                nomineeDetails: 3,
                documents: 4,
                review: 5,
            };

            const requestStepOrder = stepOrder[activeSteps];
            const currentStepOrder = stepOrder[currentActiveSteps];

            let finalActiveStep = currentActiveSteps;

            if (requestStepOrder > currentStepOrder) {
                finalActiveStep = activeSteps;
            } else {
                finalActiveStep = currentActiveSteps;
            }

            // Step 1: Basic Details
            if (activeSteps === "basicDetails") {
                detailId = serviceRequestExists?.basicDetailsId || null;
                const updated = await this.updateBasicDetails(
                    updateData.aadharNumber,
                    updateData.panNumber,
                    userId,
                    detailId
                );
                if (!updated) {
                    return { status: false, message: failedToUpdateBasicDetails };
                }
                detailId = serviceRequestExists.basicDetailsId;
            }

            // Step 2: Personal Details
            else if (activeSteps === "personalDetails") {
                detailId = await this.savePersonalDetails(
                    serviceRequestExists?.personalDetailsId || null,
                    updateData.email,
                    updateData.mobile,
                    updateData.placeOfBirth,
                    updateData.income,
                    updateData.occupation,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: failedToSavePersonalDetails };
                }
            }

            // Step 3: Nominee Details
            else if (activeSteps === "nomineeDetails") {
                detailId = await this.saveNomineeDetails(
                    serviceRequestExists?.nomineeDetailsId || null,
                    updateData.nomineeIdType,
                    updateData.nomineeId,
                    updateData.nomineeMobile,
                    updateData.nomineeRelation,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: failedToSaveNomineeDetails };
                }
            }

            // Step 4: Documents
            else if (activeSteps === "documents") {
                detailId = await this.saveDocuments(
                    serviceRequestExists?.documentsId || null,
                    updateData.aadharCardFileKey,
                    updateData.panCardFileKey,
                    updateData.bankProofFileKey,
                    updateData.salarySlipsFileKey,
                    updateData.itrDocumentsFileKey,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: failedToSaveDocuments };
                }
            }

            // Step 5: Review
            else if (activeSteps === "review") {
                await this.dataSource.query(
                    `UPDATE investmentdetails 
         SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
         WHERE serviceRequestId = ?`,
                    [updateData.submit, activeSteps, userId, serviceRequestId]
                );

                return { status: true, message: reviewStepCompletedSuccessfully };
            }

            if (detailId) {
                if (serviceRequestExists) {
                    await this.dataSource.query(
                        `UPDATE investmentdetails 
                            SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                            WHERE serviceRequestId = ?`,
                        [detailId, finalActiveStep, userId, serviceRequestId]
                    );
                } else {
                    const invQuery = `
          INSERT INTO investmentdetails 
          (${activeSteps}Id, serviceRequestId, status, activeSteps, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, NOW())
        `;
                    await this.insertAndReturnId(invQuery, [
                        detailId,
                        serviceRequestId,
                        updateData.status || "active",
                        activeSteps,
                        userId,
                    ]);
                }
            }
            const service = activeSteps
            function formatStepName(step: string): string {
                return step
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());
            }
            const formattedStep = formatStepName(service);
            return {
                message: `${formattedStep} ${UpdatedSuccessfully}`,
                status: true,
                data: serviceRequestExists
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeUpdateError,
                error: error.message,
            };
        }
    }
}

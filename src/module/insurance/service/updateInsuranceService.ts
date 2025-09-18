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
    updatedSuccessfully
} from '../common/insuranceMessage';
import { InsuranceSchema } from '../insuranceEntity/insuranceEntity';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
// import { UpdateServiceTypeByUserMailService } from 'src/utils/mailer/updateServiceTypeByUserMailService';
@Injectable()
export class UpdateInsuranceByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        // private readonly updateServiceTypeByUserMailService: UpdateServiceTypeByUserMailService,
    ) { }

    async getServiceRequestById(serviceRequestId: number): Promise<InsuranceSchema | null> {
        const serviceType = await this.dataSource.query(
            `SELECT * FROM insurancedetails i WHERE i.serviceRequestId = ?; `,
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
      UPDATE insurancebasicdetails
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
        motherName: string,
        heightCM: string,
        placeOfBirth: { city: string; state: string },
        weightKG: number,
        income: string,
        occupation: string,
        smoker: string,
        alcohol: string,
        userId: number
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
            income,
            weightKG,
            occupation,
            smoker,
            alcohol,
            userId
        ]);
        if (result.insertId && result.insertId !== 0) {
            return result.insertId;
        }
        return id;
    }

    async saveNomineeDetails(
        id: number | null,
        nomineeName: string,
        nomineeDOB: Timestamp,
        nomineeRelation: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE insurancenomineedetails
          SET nomineeName = ?,
              nomineeDOB = ?,
              nomineeRelation = ?,
              updatedBy = ?, 
              updatedAt = NOW()
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
          UPDATE insurancedocuments
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
    async updateInsurnaceById(
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
                    updateData.motherName,
                    updateData.heightCM,
                    updateData.placeOfBirth,
                    updateData.income,
                    updateData.weightKG,
                    updateData.occupation,
                    updateData.smoker,
                    updateData.alcohol,
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
                    updateData.nomineeName,
                    updateData.nomineeDOB,
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
                    `UPDATE insurancedetails
         SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
         WHERE serviceRequestId = ?`,
                    [updateData.submit, activeSteps, userId, serviceRequestId]
                );

                return { status: true, message: reviewStepCompletedSuccessfully };
            }

            if (detailId) {
                if (serviceRequestExists) {
                    await this.dataSource.query(
                        `UPDATE insurancedetails
                            SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                            WHERE serviceRequestId = ?`,
                        [detailId, finalActiveStep, userId, serviceRequestId]
                    );
                } else {
                    const invQuery = `
          INSERT INTO insurancedetails
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
                message: `${formattedStep} ${updatedSuccessfully}`,
                status: true,
                data: serviceRequestExists
            };
        } catch (error) {
            return {
                status: false,
                message: insuranceUpdateError,
                error: error.message,
            };
        }
    }
}

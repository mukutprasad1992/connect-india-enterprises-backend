import { Injectable } from '@nestjs/common';
import { DataSource, Timestamp } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    loanUpdateError,
    reviewStepCompletedSuccessfully,
    failedToSavePersonalDetails,
    failedToSaveDocuments,
    updatedSuccessfully,
    feildToSaveReferenceDetails,
    feildToSaveContactDetails,
    feildToSaveEmploymentDetails
} from '../common/loanMessage';
import { LoanSchema } from '../loanEntity/loanEntity';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { number } from 'joi';
// import { UpdateServiceTypeByUserMailService } from 'src/utils/mailer/updateServiceTypeByUserMailService';
@Injectable()
export class UpdateLoanByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        // private readonly updateServiceTypeByUserMailService: UpdateServiceTypeByUserMailService,
    ) { }

    async getServiceRequestById(serviceRequestId: number): Promise<LoanSchema | null> {
        const serviceType = await this.dataSource.query(
            `SELECT * FROM loandetails l WHERE l.serviceRequestId = ?; `,
            [serviceRequestId]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
        const result: any = await this.dataSource.query(query, params);
        return result && result.insertId ? result.insertId : null;
    }
    async updatePersonalDetails(
        aadharNumber: string,
        panNumber: string,
        motherName: string,
        maritalStatus: string,
        currentAddress: string,
        userId: number,
        basicDetailsId: number,
    ): Promise<boolean> {
        const query = `
      UPDATE loanpersonaldetails
      SET aadharNumber = ?, 
          panNumber = ?, 
          motherName= ?,
          maritalStatus= ?,
          currentAddress = ?,
          updatedBy = ?, 
          updatedAt = NOW()
      WHERE id = ?
    `;
        const result: any = await this.dataSource.query(query, [
            aadharNumber,
            panNumber,
            motherName,
            maritalStatus,
            currentAddress,
            userId,
            basicDetailsId,
        ]);
        return result.affectedRows > 0;
    }
    async saveContactdetails(
        id: number | null,
        yearsOfCity: number,
        alternateNo: string,
        landmark: string,
        userId: number,
    ): Promise<number | null> {
        const query = `
        INSERT INTO loancontactdetails
            (id, yearsOfCity, alternateNo, landmark, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            yearsOfCity = VALUES(yearsOfCity),
            alternateNo = VALUES(alternateNo),
            landmark = VALUES(landmark),
            updatedBy = VALUES(createdBy),
            updatedAt = NOW()
    `;

        const result: any = await this.dataSource.query(query, [
            id,
            yearsOfCity,
            alternateNo,
            landmark,
            userId
        ]);

        if (result.insertId && result.insertId !== 0) {
            return result.insertId;
        }
        return id;
    }

    async saveEmploymentDetails(
        id: number | null,
        designation: string,
        companyExp: number,
        officeMobile: string,
        officeAddress: string,
        totalWorkExp: number,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE loanemploymentdetails
          SET designation = ?,
              companyExp = ?,
              officeMobile = ?,
              officeAddress = ?,
              totalWorkExp = ?,
              updatedBy = ?, 
              updatedAt = NOW()
          WHERE id = ?
        `;

            const result: any = await this.dataSource.query(query, [
                designation,
                companyExp,
                officeMobile,
                officeAddress,
                totalWorkExp,
                userId,
                id,
            ]);

            return result.affectedRows > 0 ? id : null;
        } else {
            const query = `
          INSERT INTO loanemploymentdetails
              (designation, companyExp, officeMobile, officeAddress, totalWorkExp, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
            const result: any = await this.dataSource.query(query, [
                designation,
                companyExp,
                officeMobile,
                officeAddress,
                totalWorkExp,
                userId,
            ]);

            return result.insertId || null;
        }
    }


    async saveReferencedetails(
        id: number | null,
        ref1Name: string,
        ref1Mobile: string,
        ref1Address: string,
        ref2Name: string,
        ref2Mobile: string,
        ref2Address: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE loanreferencedetails
          SET ref1Name = ?,
              ref1Mobile = ?,
              ref1Address = ?,
              ref2Name = ?,
              ref2Mobile = ?,
              ref2Address = ?,
              updatedBy = ?, 
              updatedAt = NOW()
          WHERE id = ?
        `;

            const result: any = await this.dataSource.query(query, [
                ref1Name,
                ref1Mobile,
                ref1Address,
                ref2Name,
                ref2Mobile,
                ref2Address,
                userId,
                id,
            ]);

            return result.affectedRows > 0 ? id : null;
        } else {
            const query = `
          INSERT INTO loanreferencedetails
              (ref1Name, ref1Mobile, ref1Address, ref2Name, ref2Mobile, ref2Address, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
            const result: any = await this.dataSource.query(query, [
                ref1Name,
                ref1Mobile,
                ref1Address,
                ref2Name,
                ref2Mobile,
                ref2Address,
                userId,
            ]);

            return result.insertId || null;
        }
    }


    async saveDocuments(
        id: number | null,
        aadharCardFileKey: string,
        panCardFileKey: string,
        photoFileKey: string,
        salarySlipsFileKey: string,
        bankStatementFileKey: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            const query = `
          UPDATE loandocuments
          SET aadharCardFileKey = ?,
              panCardFileKey = ?,
              photoFileKey = ?,
              salarySlipsFileKey = ?,
              bankStatementFileKey = ?,
              updatedBy = ?, 
              updatedAt = NOW()
          WHERE id = ?
        `;

            const result: any = await this.dataSource.query(query, [
                aadharCardFileKey,
                panCardFileKey,
                photoFileKey,
                salarySlipsFileKey,
                bankStatementFileKey,
                userId,
                id,
            ]);

            return result.affectedRows > 0 ? id : null;
        } else {
            const query = `
          INSERT INTO loandocuments
              (aadharCardFileKey, panCardFileKey, photoFileKey, salarySlipsFileKey, bankStatementFileKey, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

            const result: any = await this.dataSource.query(query, [
                aadharCardFileKey,
                panCardFileKey,
                photoFileKey,
                salarySlipsFileKey,
                bankStatementFileKey,
                userId,
            ]);

            return result.insertId || null;
        }
    }
    async updateLoanById(
        serviceRequestId: number,
        userId: number,
        updateData: any
    ): Promise<any> {
        try {
            let serviceRequestExists = await this.getServiceRequestById(serviceRequestId);
            const activeSteps = updateData.activeSteps;
            const currentActiveSteps = serviceRequestExists.activeSteps;
            let detailId: number | null = null;

            const stepOrder: { [key: string]: number } = {
                personalDetails: 1,
                contactDetails: 2,
                employmentDetails: 3,
                referenceDetails: 4,
                documents: 5,
                review: 6,
            };

            const requestStepOrder = stepOrder[activeSteps];
            const currentStepOrder = stepOrder[currentActiveSteps];

            let finalActiveStep = currentActiveSteps;

            if (requestStepOrder > currentStepOrder) {
                finalActiveStep = activeSteps;
            } else {
                finalActiveStep = currentActiveSteps;
            }

            // Step 1: personal Details
            if (activeSteps === "personalDetails") {
                detailId = serviceRequestExists?.personalDetailsId || null;
                const updated = await this.updatePersonalDetails(
                    updateData.aadharNumber,
                    updateData.panNumber,
                    updateData.motherName,
                    updateData.maritalStatus,
                    updateData.currentAddress,
                    userId,
                    detailId
                );
                if (!updated) {
                    return { status: false, message: failedToSavePersonalDetails };
                }
                detailId = serviceRequestExists.personalDetailsId;
            }

            // Step 2: contact Details
            else if (activeSteps === "contactDetails") {
                detailId = await this.saveContactdetails(
                    serviceRequestExists?.contactDetailsId || null,
                    updateData.yearsOfCity,
                    updateData.alternateNo,
                    updateData.landmark,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: feildToSaveContactDetails };
                }
            }

            // Step 3: employment Details
            else if (activeSteps === "employmentDetails") {
                detailId = await this.saveEmploymentDetails(
                    serviceRequestExists?.employmentDetailsId || null,
                    updateData.designation,
                    updateData.companyExp,
                    updateData.officeMobile,
                    updateData.officeAddress,
                    updateData.totalWorkExp,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: feildToSaveEmploymentDetails };
                }
            }
            // step 4 reference 
            else if (activeSteps === "referenceDetails") {
                detailId = await this.saveReferencedetails(
                    serviceRequestExists?.referenceDetailsId || null,
                    updateData.ref1Name,
                    updateData.ref1Mobile,
                    updateData.ref1Address,
                    updateData.ref2Name,
                    updateData.ref2Mobile,
                    updateData.ref2Address,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: feildToSaveReferenceDetails };
                }
            }
            // Step 5: Documents
            else if (activeSteps === "documents") {
                detailId = await this.saveDocuments(
                    serviceRequestExists?.documentsId || null,
                    updateData.aadharCardFileKey,
                    updateData.panCardFileKey,
                    updateData.photoFileKey,
                    updateData.salarySlipsFileKey,
                    updateData.bankStatementFileKey,
                    userId
                );
                if (!detailId) {
                    return { status: false, message: failedToSaveDocuments };
                }
            }

            // Step 5: Review
            else if (activeSteps === "review") {
                await this.dataSource.query(
                    `UPDATE loandetails
         SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
         WHERE serviceRequestId = ?`,
                    [updateData.submit, activeSteps, userId, serviceRequestId]
                );

                return { status: true, message: reviewStepCompletedSuccessfully };
            }

            if (detailId) {
                if (serviceRequestExists) {
                    await this.dataSource.query(
                        `UPDATE loandetails
                   SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                WHERE serviceRequestId = ?`,
                        [detailId, finalActiveStep, userId, serviceRequestId]
                    );
                } else {
                    const invQuery = `
          INSERT INTO loandetails
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
                message: loanUpdateError,
                error: error.message,
            };
        }
    }
}

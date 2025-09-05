import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    serviceTypeNotFound,
    noValidFieldsProvidedForUpdate,
    failedToRetrieveTheIDOfTheLastInsertedServiceType
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
        // result.affectedRows tells how many rows got updated
        return result.affectedRows > 0;
    }

    async savePersonalDetails(
        id: number | null, // null → insert, number → update
        email: string,
        mobile: string,
        placeOfBirth: { city: string; state: string },
        income: string,
        occupation: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            // ✅ UPDATE if id exists
            const query = `
          UPDATE personaldetails
          SET email = ?,
              mobile = ?,
              placeOfBirth = ?,
              income = ?,
              occupation = ?,
              updatedBy = ?, 
              updatedAt = NOW()
          WHERE id = ?
        `;

            const result: any = await this.dataSource.query(query, [
                email,
                mobile,
                JSON.stringify(placeOfBirth),
                income,
                occupation,
                userId,
                id,
            ]);

            return result.affectedRows > 0 ? id : null;
        } else {
            // ✅ INSERT if id is null
            const query = `
          INSERT INTO personaldetails 
              (email, mobile, placeOfBirth, income, occupation, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

            const result: any = await this.dataSource.query(query, [
                email,
                mobile,
                JSON.stringify(placeOfBirth),
                income,
                occupation,
                userId,
            ]);

            return result.insertId || null;
        }
    }

    async saveNomineeDetails(
        id: number | null, // null → insert, number → update
        nomineeIdType: string,
        nomineeId: string,
        nomineeMobile: string,
        nomineeRelation: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            // ✅ UPDATE if id exists
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
            // ✅ INSERT if id is null
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
        id: number | null, // null → insert, number → update
        aadharCardFileKey: string,
        panCardFileKey: string,
        bankProofFileKey: string,
        salarySlipsFileKey: string,
        itrDocumentsFileKey: string,
        userId: number
    ): Promise<number | null> {
        if (id) {
            // ✅ UPDATE if id exists
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
            // ✅ INSERT if id is null
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
            const activeSteps = updateData.stepStatus;

            let detailId: number | null = null;

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
                    return { status: false, message: "Failed to update basic details" };
                }
                detailId = serviceRequestExists.basicDetailsId; // already present
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
                    return { status: false, message: "Failed to save personal details" };
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
                    return { status: false, message: "Failed to save nominee details" };
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
                    return { status: false, message: "Failed to save documents" };
                }
            }

            // Step 5: Review
            else if (activeSteps === "review") {
                // Just mark submit in investmentdetails
                const submitStatus = updateData.isDetailsConfirmed === 1 ? 'complete' : 'inComplete';
                await this.dataSource.query(
                    `UPDATE investmentdetails 
         SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
         WHERE serviceRequestId = ?`,
                    [updateData.isDetailsConfirmed ? "completed" : "pending", activeSteps, userId, serviceRequestId]
                );

                return { status: true, message: "Review step completed successfully" };
            }

            // ✅ Update/Insert into investmentdetails
            if (detailId) {
                if (serviceRequestExists) {
                    // Update existing record
                    await this.dataSource.query(
                        `UPDATE investmentdetails 
           SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
           WHERE serviceRequestId = ?`,
                        [detailId, activeSteps, userId, serviceRequestId]
                    );
                } else {
                    // Insert new record
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

            return {
                message: serviceTypeUpdatedSuccessfully,
                status: true,
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

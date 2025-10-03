import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    serviceTypeUpdateError,
    reviewStepCompletedSuccessfully,
    failedToUpdateBasicDetails,
    failedToSavePersonalDetails,
    failedToSaveNomineeDetails,
    failedToSaveDocuments,
    updatedSuccessfully,
    errorInUpdateServiceTypeById,
    insertedNewInvestmentdetailsRecord,
    andUserId,
    markingReviewCompleted,
    fetchingServiceRequestId,
    insertedRecordWithId,
    updatingBasicDetailsId,
    basicDetailsUpdatedSuccessfullyForUserId,
    failedToUpdateBasicDetailsForUserId,
    savingPersonalDetailsForUserId,
    insertedPersonalDetailsId,
    updatedExistingPersonalDetailsId,
    savingNomineeDetailsForUserId,
    nomineeDetailsUpdatedForId,
    failedToUpdateNomineeDetailsForId,
    insertedNomineeDetailsId,
    savingDocumentsForUserId,
    documentsUpdatedForId,
    failedToUpdateDocumentsForId,
    insertedDocumentsId,
    updatedInvestmentdetailsForServiceRequestId
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UpdatedServiceMessageService } from '../common/template/serviceTypeUpdateNotificationMessageTemplate';
import { UpdateServiceTypeByUserMailService } from 'src/utils/mailer/updateServiceTypeByUserMailService';

@Injectable()
export class UpdateServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly updatedServiceMessageService: UpdatedServiceMessageService,
        private readonly updateServiceTypeByUserMailService: UpdateServiceTypeByUserMailService,
        private readonly logger: AppLogger,
    ) { }

    async getServiceRequestById(serviceRequestId: number): Promise<ServiceTypeSchema | null> {
        this.logger.doLog(`${fetchingServiceRequestId} = ${serviceRequestId}`, 'success');
        const serviceType = await this.dataSource.query(
            `SELECT * FROM investmentdetails i WHERE i.serviceRequestId = ?; `,
            [serviceRequestId]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
        const result: any = await this.dataSource.query(query, params);
        if (result?.insertId) {
            this.logger.doLog(`${insertedRecordWithId} = ${result.insertId}`, 'success');
        }
        return result && result.insertId ? result.insertId : null;
    }

    async updateBasicDetails(
        aadharNumber: string,
        panNumber: string,
        userId: number,
        basicDetailsId: number,
    ): Promise<boolean> {
        this.logger.doLog(`${updatingBasicDetailsId} = ${basicDetailsId} by userId=${userId}`, 'success');
        const query = `
            UPDATE investmentBasicdetails
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
        const success = result.affectedRows > 0;
        this.logger.doLog(
            success
                ? `${basicDetailsUpdatedSuccessfullyForUserId} = ${userId}`
                : `${failedToUpdateBasicDetailsForUserId} = ${userId}`,
            success ? 'success' : 'fail'
        );
        return success;
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
        this.logger.doLog(`${savingPersonalDetailsForUserId} = ${userId}`, 'success');
        const query = `
            INSERT INTO investmentpersonaldetails
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
            this.logger.doLog(`${insertedPersonalDetailsId} = ${result.insertId}`, 'success');
            return result.insertId;
        }
        this.logger.doLog(`${updatedExistingPersonalDetailsId} = ${id}`, 'success');
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
        this.logger.doLog(`${savingNomineeDetailsForUserId} = ${userId}`, 'success');
        if (id) {
            const query = `
                UPDATE investmentnomineedetails
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
            const success = result.affectedRows > 0;
            this.logger.doLog(
                success
                    ? `${nomineeDetailsUpdatedForId} = ${id}`
                    : `${failedToUpdateNomineeDetailsForId} = ${id}`,
                success ? 'success' : 'fail'
            );
            return success ? id : null;
        } else {
            const query = `
                INSERT INTO investmentnomineedetails
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
            this.logger.doLog(`${insertedNomineeDetailsId} = ${result.insertId}`, 'success');
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
        this.logger.doLog(`${savingDocumentsForUserId} = ${userId}`, 'success');
        if (id) {
            const query = `
                UPDATE investmentDocuments
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
            const success = result.affectedRows > 0;
            this.logger.doLog(
                success
                    ? `${documentsUpdatedForId} = ${id}`
                    : `${failedToUpdateDocumentsForId} = ${id}`,
                success ? 'success' : 'fail'
            );
            return success ? id : null;
        } else {
            const query = `
                INSERT INTO investmentDocuments
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
            this.logger.doLog(`${insertedDocumentsId} = ${result.insertId}`, 'success');
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

            const stepOrder: { [key: string]: number } = {
                basicDetails: 1,
                personalDetails: 2,
                nomineeDetails: 3,
                documents: 4,
                review: 5,
            };

            const requestStepOrder = stepOrder[activeSteps];
            const currentStepOrder = stepOrder[currentActiveSteps];
            let finalActiveStep = requestStepOrder > currentStepOrder ? activeSteps : currentActiveSteps;

            // === Basic Details
            if (activeSteps === "basicDetails") {
                detailId = serviceRequestExists?.basicDetailsId || null;
                const updated = await this.updateBasicDetails(
                    updateData.aadharNumber,
                    updateData.panNumber,
                    userId,
                    detailId
                );
                if (!updated) {
                    this.logger.doLog(failedToUpdateBasicDetails, 'fail');
                    return { status: false, message: failedToUpdateBasicDetails };
                }
                detailId = serviceRequestExists.basicDetailsId;
            }

            // === Personal Details
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
                    this.logger.doLog(failedToSavePersonalDetails, 'fail');
                    return { status: false, message: failedToSavePersonalDetails };
                }
            }

            // === Nominee Details
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
                    this.logger.doLog(failedToSaveNomineeDetails, 'fail');
                    return { status: false, message: failedToSaveNomineeDetails };
                }
            }

            // === Documents
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
                    this.logger.doLog(failedToSaveDocuments, 'fail');
                    return { status: false, message: failedToSaveDocuments };
                }
            }

            // === Review
            else if (activeSteps === "review") {
                await this.dataSource.query(
                    `UPDATE investmentdetails 
                        SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                        WHERE serviceRequestId = ?`,
                    [updateData.submit, activeSteps, userId, serviceRequestId]
                );
                this.logger.doLog(`${markingReviewCompleted}=${serviceRequestId} ${andUserId}=${userId}`, 'success');
                return { status: true, message: reviewStepCompletedSuccessfully };
            }

            // Insert or Update `investmentdetails`
            if (detailId) {
                if (serviceRequestExists) {
                    await this.dataSource.query(
                        `UPDATE investmentdetails 
                            SET ${activeSteps}Id = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                            WHERE serviceRequestId = ?`,
                        [detailId, finalActiveStep, userId, serviceRequestId]
                    );
                    this.logger.doLog(`${updatedInvestmentdetailsForServiceRequestId} = ${serviceRequestId}`, 'success');
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
                    this.logger.doLog(insertedNewInvestmentdetailsRecord, 'success');
                }
            }

            const service = activeSteps;
            function formatStepName(step: string): string {
                return step.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
            }
            const formattedStep = formatStepName(service);

            return {
                message: `${formattedStep} ${updatedSuccessfully}`,
                status: true,
                data: serviceRequestExists
            };
        } catch (error) {
            this.logger.doLog(`${errorInUpdateServiceTypeById} ${error.message}`, 'fail');
            return {
                status: false,
                message: serviceTypeUpdateError,
                error: error.message,
            };
        }
    }
}

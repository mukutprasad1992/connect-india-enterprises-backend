import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    loanUpdateError,
    reviewStepCompletedSuccessfully,
    failedToSavePersonalDetails,
    failedToSaveDocuments,
    updatedSuccessfully,
    feildToSaveReferenceDetails,
    feildToSaveContactDetails,
    feildToSaveEmploymentDetails,
    errorUpdatingLoanId,
    completedSuccessfullyForLoanId,
    reviewStepCompletedForLoanId,
    failedToSaveDocumentsForLoanId,
    failedToSaveReferenceDetailsForLoanId,
    failedToSaveEmploymentDetailsForLoanId,
    failedToSaveContactDetailsForLoanId,
    failedToSavePersonalDetailsForLoanId,
    startingLoanUpdateForServiceRequestId,
    documentsInsertedWithID,
    savingDocumentDetailsForUserId,
    referenceDetailsInsertedWithID,
    referenceDetailsUpdate,
    savingReferenceDetailsForUserId,
    employmentDetailsInsertedWithID,
    employmentDetailsUpdate,
    savingEmploymentDetailsForUserId,
    contactDetailsSavedWithID,
    savingContactDetailsForUserId,
    personalDetailsUpdate,
    updatingPersonalDetailsForUserId,
    insertReturnedId,
    executingInsertQueryParamsHidden,
    serviceRequest,
    fetchingLoanDetailsForServiceRequestId
} from '../common/loanMessage';
import { LoanSchema } from '../loanEntity/loanEntity';

@Injectable()
export class UpdateLoanByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly logger: AppLogger,
    ) { }

    async getServiceRequestById(serviceRequestId: number): Promise<LoanSchema | null> {
        this.logger.doLog(`${fetchingLoanDetailsForServiceRequestId} ${serviceRequestId}`, 'info');
        const serviceType = await this.dataSource.query(
            `SELECT * FROM loandetails l WHERE l.serviceRequestId = ?;`,
            [serviceRequestId]
        );
        const exists = serviceType.length > 0 ? serviceType[0] : null;
        this.logger.doLog(`${serviceRequest} ${serviceRequestId} ${exists ? 'found' : 'not found'}`, 'info');
        return exists;
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
        this.logger.doLog(executingInsertQueryParamsHidden, 'info');
        const result: any = await this.dataSource.query(query, params);
        const id = result && result.insertId ? result.insertId : null;
        this.logger.doLog(`${insertReturnedId} ${id}`, 'info');
        return id;
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
        this.logger.doLog(`${updatingPersonalDetailsForUserId} ${userId}, basicDetailsId: ${basicDetailsId}`, 'info');
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
        const success = result.affectedRows > 0;
        this.logger.doLog(`${personalDetailsUpdate} ${success ? 'successful' : 'failed'}`, success ? 'success' : 'warn');
        return success;
    }

    async saveContactdetails(
        id: number | null,
        yearsOfCity: number,
        alternateNo: string,
        landmark: string,
        userId: number,
    ): Promise<number | null> {
        this.logger.doLog(`${savingContactDetailsForUserId} ${userId}, contactId: ${id}`, 'info');
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
        const detailId = result.insertId && result.insertId !== 0 ? result.insertId : id;
        this.logger.doLog(`${contactDetailsSavedWithID} ${detailId}`, 'info');
        return detailId;
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
        this.logger.doLog(`${savingEmploymentDetailsForUserId} ${userId}, employmentId: ${id}`, 'info');

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
            const success = result.affectedRows > 0;
            this.logger.doLog(`${employmentDetailsUpdate} ${success ? 'successful' : 'failed'}`, success ? 'success' : 'warn');
            return success ? id : null;
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
            const insertedId = result.insertId || null;
            this.logger.doLog(`${employmentDetailsInsertedWithID} ${insertedId}`, 'info');
            return insertedId;
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
        this.logger.doLog(`${savingReferenceDetailsForUserId} ${userId}, referenceId: ${id}`, 'info');

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
            const success = result.affectedRows > 0;
            this.logger.doLog(`${referenceDetailsUpdate} ${success ? 'successful' : 'failed'}`, success ? 'success' : 'warn');
            return success ? id : null;
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
            const insertedId = result.insertId || null;
            this.logger.doLog(`${referenceDetailsInsertedWithID} ${insertedId}`, 'info');
            return insertedId;
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
        this.logger.doLog(`${savingDocumentDetailsForUserId} ${userId}, documentsId: ${id}`, 'info');

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
            const success = result.affectedRows > 0;
            this.logger.doLog(`Documents update ${success ? 'successful' : 'failed'}`, success ? 'success' : 'warn');
            return success ? id : null;
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
            const insertedId = result.insertId || null;
            this.logger.doLog(`${documentsInsertedWithID} ${insertedId}`, 'info');
            return insertedId;
        }
    }

    async updateLoanById(
        serviceRequestId: number,
        userId: number,
        updateData: any
    ): Promise<any> {
        this.logger.doLog(`${startingLoanUpdateForServiceRequestId} ${serviceRequestId}, userId: ${userId}`, 'info');
        try {
            let serviceRequestExists = await this.getServiceRequestById(serviceRequestId);
            const activeSteps = updateData.activeSteps;
            const currentActiveSteps = serviceRequestExists?.activeSteps;
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
            const currentStepOrder = currentActiveSteps ? stepOrder[currentActiveSteps] : 0;
            let finalActiveStep = currentActiveSteps || activeSteps;

            if (requestStepOrder > currentStepOrder) {
                finalActiveStep = activeSteps;
            }

            // Step handling
            switch (activeSteps) {
                case 'personalDetails':
                    detailId = serviceRequestExists?.personalDetailsId || null;
                    const updatedPersonal = await this.updatePersonalDetails(
                        updateData.aadharNumber,
                        updateData.panNumber,
                        updateData.motherName,
                        updateData.maritalStatus,
                        updateData.currentAddress,
                        userId,
                        detailId
                    );
                    if (!updatedPersonal) {
                        this.logger.doLog(`${failedToSavePersonalDetailsForLoanId} ${serviceRequestId}`, 'warn');
                        return { status: false, message: failedToSavePersonalDetails };
                    }
                    detailId = serviceRequestExists?.personalDetailsId;
                    break;

                case 'contactDetails':
                    detailId = await this.saveContactdetails(
                        serviceRequestExists?.contactDetailsId || null,
                        updateData.yearsOfCity,
                        updateData.alternateNo,
                        updateData.landmark,
                        userId
                    );
                    if (!detailId) {
                        this.logger.doLog(`${failedToSaveContactDetailsForLoanId} ${serviceRequestId}`, 'warn');
                        return { status: false, message: feildToSaveContactDetails };
                    }
                    break;

                case 'employmentDetails':
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
                        this.logger.doLog(`${failedToSaveEmploymentDetailsForLoanId} ${serviceRequestId}`, 'warn');
                        return { status: false, message: feildToSaveEmploymentDetails };
                    }
                    break;

                case 'referenceDetails':
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
                        this.logger.doLog(`${failedToSaveReferenceDetailsForLoanId} ${serviceRequestId}`, 'warn');
                        return { status: false, message: feildToSaveReferenceDetails };
                    }
                    break;

                case 'documents':
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
                        this.logger.doLog(`${failedToSaveDocumentsForLoanId} ${serviceRequestId}`, 'warn');
                        return { status: false, message: failedToSaveDocuments };
                    }
                    break;

                case 'review':
                    await this.dataSource.query(
                        `UPDATE loandetails
                         SET submit = ?, activeSteps = ?, updatedBy = ?, updatedAt = NOW()
                         WHERE serviceRequestId = ?`,
                        [updateData.submit, activeSteps, userId, serviceRequestId]
                    );
                    this.logger.doLog(`${reviewStepCompletedForLoanId} ${serviceRequestId}`, 'success');
                    return { status: true, message: reviewStepCompletedSuccessfully };
            }

            // Update loandetails table
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

            const formatStepName = (step: string) =>
                step.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            const formattedStep = formatStepName(activeSteps);

            this.logger.doLog(`Step ${formattedStep} ${completedSuccessfullyForLoanId} ${serviceRequestId}`, 'success');

            return {
                message: `${formattedStep} ${updatedSuccessfully}`,
                status: true,
                data: serviceRequestExists
            };

        } catch (error) {
            this.logger.doLog(`${errorUpdatingLoanId} ${serviceRequestId}, error: ${error.message}`, 'error');
            return {
                status: false,
                message: loanUpdateError,
                error: error.message
            };
        }
    }
}

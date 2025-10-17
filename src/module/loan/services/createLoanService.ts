import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLoanDTO } from '../loanDTO/createLoanDTO';
import { UserSchema } from '../../user/userEntity/userSchema';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { LoanMailService } from 'src/utils/mailer/loanMailer';
import { AppLogger } from 'src/utils/common/loggerService';

import {
    userNotFound,
    failedToRetrieveTheIDOfTheLastInsertedLoan,
    yourLoanRequestHasBeenCreatedSuccessfully,
    invalidServiceSubType,
    failedToCreateLoanRequest,
    failedToCreateBasicDetails,
    ANew,
    createdSuccessfully,
    loanCreationError,
    loanHasBeenCreatedBy,
    andrequiresYourAttention,
    fetchingUserByID,
    userNotFoundWithID,
    userFound,
    fetchingServiceSubTypeIDFor,
    foundServiceSubTypeID,
    insertedRecordWithID,
    insertQueryFailed,
    creatingServiceRequestForUserId,
    addingPersonalDetailsForUserId,
    startingLoanCreationForUserId,
    loanCreatedSuccessfullyWithID,
    loanCreationEmailSentTo,
    notificationCreationFailedForLoanId,
    notificationCreatedSuccessfullyForLoanId,
} from '../common/loanMessage';
import { notificationCreationFailed } from '../../notificaton/common/notificationMessage';

@Injectable()
export class CreateLoanService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly loanMailService: LoanMailService,
        private readonly logger: AppLogger,
    ) { }

    async getUserById(userId: number): Promise<UserSchema | null> {
        this.logger.doLog(`${fetchingUserByID} ${userId}`, 'info');
        const user = await this.dataSource.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user.length) {
            this.logger.doLog(`${userNotFoundWithID} ${userId}`, 'warn');
            return null;
        }
        this.logger.doLog(`${userFound} ${user[0].email}`, 'info');
        return user[0];
    }

    async getServiceSubTypeId(serviceSubType: string): Promise<{ id: number } | null> {
        this.logger.doLog(`${fetchingServiceSubTypeIDFor} ${serviceSubType}`, 'info');
        const result = await this.dataSource.query('SELECT id FROM servicesubtypes WHERE ledgerType = ?', [serviceSubType]);
        if (!result.length) {
            this.logger.doLog(`${invalidServiceSubType} ${serviceSubType}`, 'warn');
            return null;
        }
        this.logger.doLog(`${foundServiceSubTypeID} ${result[0].id}`, 'info');
        return { id: result[0].id };
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
        try {
            const result: any = await this.dataSource.query(query, params);
            const insertedId = result?.insertId ?? null;
            this.logger.doLog(`${insertedRecordWithID} ${insertedId}`, 'info');
            return insertedId;
        } catch (error: any) {
            this.logger.doLog(`${insertQueryFailed} ${error.message}`, 'error');
            return null;
        }
    }

    async addServiceRequest(userId: number, serviceId: number, serviceSubTypeId: number): Promise<number | null> {
        this.logger.doLog(`${creatingServiceRequestForUserId} ${userId}`, 'info');
        const query = `
          INSERT INTO servicerequests (userId, serviceId, serviceSubTypeId, createdBy, createdAt)
          VALUES (?, ?, ?, ?, NOW())
        `;
        return this.insertAndReturnId(query, [userId, serviceId, serviceSubTypeId, userId]);
    }

    async addPersonalDetails(
        userId: number,
        aadharNumber: string,
        panNumber: string,
        motherName: string,
        maritalStatus: string,
        currentAddress: string,
    ): Promise<number | null> {
        this.logger.doLog(`${addingPersonalDetailsForUserId} ${userId}`, 'info');
        const query = `
          INSERT INTO loanpersonaldetails 
          (aadharNumber, panNumber, motherName, maritalStatus, currentAddress, createdBy, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        return this.insertAndReturnId(query, [aadharNumber, panNumber, motherName, maritalStatus, currentAddress, userId]);
    }

    async createLoan(userId: number, dto: CreateLoanDTO): Promise<any> {
        this.logger.doLog(`${startingLoanCreationForUserId} ${userId}`, 'info');
        try {
            const user = await this.getUserById(userId);
            if (!user) return { status: false, message: userNotFound };

            const serviceSubType = await this.getServiceSubTypeId(dto.serviceSubType);
            if (!serviceSubType) return { status: false, message: `${invalidServiceSubType}: ${dto.serviceSubType}` };

            const serviceRequestId = await this.addServiceRequest(userId, dto.serviceId, serviceSubType.id);
            if (!serviceRequestId) return { status: false, message: failedToCreateLoanRequest };

            const personalDetailsId = await this.addPersonalDetails(
                userId,
                dto.aadharNumber,
                dto.panNumber,
                dto.motherName,
                dto.maritalStatus,
                dto.currentAddress,
            );
            if (!personalDetailsId) return { status: false, message: failedToCreateBasicDetails };

            const invQuery = `
                INSERT INTO loandetails
                (personalDetailsId, serviceRequestId, status, activeSteps, createdBy, createdAt)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            const loanId = await this.insertAndReturnId(invQuery, [
                personalDetailsId,
                serviceRequestId,
                dto.status,
                dto.activeSteps,
                userId,
            ]);
            if (!loanId) return { status: false, message: failedToRetrieveTheIDOfTheLastInsertedLoan };

            const joinedData = await this.dataSource.query(
                `
                SELECT sr.id as id, sr.serviceId, sr.serviceSubTypeId,
                       pd.id as personaldetailsId, pd.aadharNumber, pd.panNumber,
                       ind.id as loanId, ind.status, ind.activeSteps, ind.createdAt as loanCreatedAt,
                       sst.ledgerType as serviceSubTypeName
                FROM loandetails ind
                INNER JOIN loanpersonaldetails pd ON ind.personalDetailsId = pd.id
                INNER JOIN servicerequests sr ON ind.serviceRequestId = sr.id
                INNER JOIN users u ON sr.userId = u.id
                INNER JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE ind.id = ?
                `,
                [loanId],
            );

            const finalData = joinedData[0];
            this.logger.doLog(`${loanCreatedSuccessfullyWithID} ${loanId} (userId: ${userId})`, 'success');

            await this.loanMailService.emailCreateLoanTemplates(
                user.email,
                user.firstName,
                user.lastName,
                dto.status,
                dto.serviceSubType,
            );
            this.logger.doLog(`${loanCreationEmailSentTo} ${user.email}`, 'info');

            const formattedSubType = dto.serviceSubType.replace(/([a-z])([A-Z])/g, '$1 $2');
            const notificationPayload: CreateNotificationDTO = {
                message: `${ANew} <strong>${formattedSubType}</strong> ${loanHasBeenCreatedBy} <strong>${user?.firstName} ${user?.lastName}</strong> ${andrequiresYourAttention}`,
                userRoleId: 3,
                voucherId: null,
                isRead: false,
                createdBy: userId,
                updatedBy: userId,
                userId: user.id,
                vendorId: null,
                isUser: 1,
            };

            const notification = await this.createNotificationService.createNotification(notificationPayload);
            if (!notification) {
                this.logger.doLog(`${notificationCreationFailedForLoanId} ${loanId}`, 'warn');
                return { status: false, message: notificationCreationFailed };
            }
            this.logger.doLog(`${notificationCreatedSuccessfullyForLoanId} ${loanId}`, 'success');

            return {
                status: true,
                message: `${dto.activeSteps === 'basicDetails' ? 'Basic Details' : 'Insurance Details'} ${createdSuccessfully}`,
                data: finalData,
                notification: { message: yourLoanRequestHasBeenCreatedSuccessfully },
            };
        } catch (error: any) {
            this.logger.doLog(`${loanCreationError} (userId: ${userId}): ${error.message}`, 'error');
            return {
                status: false,
                message: loanCreationError,
                error: error.message,
            };
        }
    }
}

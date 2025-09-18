import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLoanDTO } from '../loanDTO/createLoanDTO';
import { LoanSchema } from '../loanEntity/loanEntity';
import { UserSchema } from '../../user/userEntity/userSchema';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    userNotFound,
    failedToRetrieveTheIDOfTheLastInsertedLoan,
    yourLoanRequestHasBeenCreatedSuccessfully,
    invalidServiceSubType,
    failedToCreateLoanRequest,
    failedToCreateBasicDetails,
    loanHasBeenCreatedByAUserAndRequiresYourAttention,
    ANew,
    createdSuccessfully,
    loanCreationError,
} from '../common/loanMessage';
import { notificationCreationFailed } from '../../notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { LoanMailService } from 'src/utils/mailer/loanMailer';

@Injectable()
export class CreateLoanService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly loanMailService: LoanMailService,
    ) { }

    async getUserById(userId: number): Promise<UserSchema | null> {
        const user = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
        );
        return user.length > 0 ? user[0] : null;
    }

    async getServiceSubTypeId(serviceSubType: string): Promise<{ id: number } | null> {
        const result = await this.dataSource.query(
            'SELECT id FROM servicesubtypes WHERE ledgerType = ?',
            [serviceSubType],
        );
        return result.length > 0 ? { id: result[0].id } : null;
    }

    private async insertAndReturnId(query: string, params: any[]): Promise<number | null> {
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
        const query = `
      INSERT INTO loanpersonaldetails (aadharNumber, panNumber, motherName, maritalStatus, currentAddress, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
        return this.insertAndReturnId(query, [aadharNumber, panNumber, motherName, maritalStatus, currentAddress, userId]);
    }

    async createLoan(userId: number, dto: CreateLoanDTO): Promise<any> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return { status: false, message: userNotFound };
            }

            const serviceSubType = await this.getServiceSubTypeId(dto.serviceSubType);
            if (!serviceSubType) {
                return { status: false, message: `${invalidServiceSubType} : ${dto.serviceSubType}` };
            }

            const serviceRequestId = await this.addServiceRequest(
                userId,
                dto.serviceId,
                serviceSubType.id,
            );
            if (!serviceRequestId) {
                return { status: false, message: failedToCreateLoanRequest };
            }

            const personalDetailsId = await this.addPersonalDetails(
                userId,
                dto.aadharNumber,
                dto.panNumber,
                dto.motherName,
                dto.maritalStatus,
                dto.currentAddress,
            );
            if (!personalDetailsId) {
                return { status: false, message: failedToCreateBasicDetails };
            }

            const invQuery = `
        INSERT INTO loandetails
        (personalDetailsId, serviceRequestId, status, activeSteps, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
            const insuranceId = await this.insertAndReturnId(invQuery, [
                personalDetailsId,
                serviceRequestId,
                dto.status,
                dto.activeSteps,
                userId,
            ]);

            if (!insuranceId) {
                return { status: false, message: failedToRetrieveTheIDOfTheLastInsertedLoan };
            }

            const joinedData = await this.dataSource.query(
                `
               SELECT
                    sr.id as id,
                    sr.serviceId, sr.serviceSubTypeId,
                   pd.id as personaldetailsId, pd.aadharNumber, pd.panNumber,
                   ind.id as insuranceId, ind.status, ind.activeSteps, ind.createdAt as insuranceCreatedAt,
                   sst.ledgerType as serviceSubTypeName
                 FROM loandetails ind
                 INNER JOIN loanpersonaldetails pd ON ind.personalDetailsId = pd.id
                 INNER JOIN servicerequests sr ON ind.serviceRequestId = sr.id
                 INNER JOIN users u ON sr.userId = u.id
                 INNER JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                 WHERE ind.id = ?
                 `,
                [insuranceId],
            );

            const finalData = joinedData[0];

            await this.loanMailService.emailCreateLoanTemplates(
                user.email,
                dto.status,
                dto.serviceSubType,
            );

            const formattedSubType = dto.serviceSubType.replace(/([a-z])([A-Z])/g, '$1 $2');
            const notificationPayload: CreateNotificationDTO = {
                message: `${ANew} <strong>${formattedSubType}</strong> ${loanHasBeenCreatedByAUserAndRequiresYourAttention}`,
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
                return { status: false, message: notificationCreationFailed };
            }
            const service = dto.activeSteps === 'basicDetails' ? 'Basic Details' : 'insurance Details';
            return {
                status: true,
                message: `${service} ${createdSuccessfully}`,
                data: finalData,
                notification: { message: yourLoanRequestHasBeenCreatedSuccessfully },
            };
        } catch (error) {
            return {
                status: false,
                message: loanCreationError,
                error: error.message,
            };
        }
    }
}

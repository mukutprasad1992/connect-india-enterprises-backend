import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceTypeDTO } from '../serviceTypeDTO/createServiceTypeDTO';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UserSchema } from '../../user/userEntity/userSchema';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { CreatedServiceSuccessMessageService } from '../common/template/serviceTypeCreatedNotificationMessagetemplate';
import {
    userNotFound,
    serviceTypeCreatedSuccessfully,
    serviceTypeCreationError,
    failedToRetrieveTheIDOfTheLastInsertedServiceType,
    yourServiceRequestHasBeenCreatedSuccessfully,
    invalidServiceSubType,
    failedToCreateServiceRequest,
    failedToCreateBasicDetails,
    serviceHasBeenCreatedByAUserAndRequiresYourAttention,
    ANew,
    createdSuccessfully,
} from '../common/serviceTypeMessage';
import { notificationCreationFailed } from '../../notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { ServiceTypeMailService } from 'src/utils/mailer/ServiceTypeMailer';

@Injectable()
export class CreateServiceTypeService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly createdServiceSuccessMessageService: CreatedServiceSuccessMessageService,
        private readonly serviceTypeMailService: ServiceTypeMailService,
    ) { }

    async getServiceTypeById(id: number): Promise<ServiceTypeSchema | null> {
        const serviceType = await this.dataSource.query(
            'SELECT * FROM servicetypes WHERE id = ?',
            [id],
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    async getUserById(userId: number): Promise<UserSchema | null> {
        const user = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
        );
        return user.length > 0 ? user[0] : null;
    }

    async getServiceSubTypeId(ServiceSubType: string): Promise<{ id: number } | null> {
        const result = await this.dataSource.query(
            'SELECT id FROM servicesubtypes WHERE ledgerType = ?',
            [ServiceSubType],
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

    async addBasicDetails(
        userId: number,
        aadharNumber: string,
        panNumber: string,
    ): Promise<number | null> {
        const query = `
      INSERT INTO basicdetails (aadharNumber, panNumber, createdBy, createdAt)
      VALUES (?, ?, ?, NOW())
    `;
        return this.insertAndReturnId(query, [aadharNumber, panNumber, userId]);
    }

    // --- Main Service ---
    async createServiceType(userId: number, dto: CreateServiceTypeDTO): Promise<any> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return { status: false, message: userNotFound };
            }

            const serviceSubType = await this.getServiceSubTypeId(dto.ServiceSubType);
            if (!serviceSubType) {
                return { status: false, message: `${invalidServiceSubType} : ${dto.ServiceSubType}` };
            }

            const serviceRequestId = await this.addServiceRequest(
                userId,
                dto.serviceId,
                serviceSubType.id,
            );
            if (!serviceRequestId) {
                return { status: false, message: failedToCreateServiceRequest };
            }

            const basicDetailsId = await this.addBasicDetails(
                userId,
                dto.aadharNumber,
                dto.panNumber,
            );
            if (!basicDetailsId) {
                return { status: false, message: failedToCreateBasicDetails };
            }

            const invQuery = `
        INSERT INTO investmentdetails 
        (basicDetailsId, serviceRequestId, status, activeSteps, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
            const investmentId = await this.insertAndReturnId(invQuery, [
                basicDetailsId,
                serviceRequestId,
                dto.status,
                dto.activeSteps,
                userId,
            ]);

            if (!investmentId) {
                return { status: false, message: failedToRetrieveTheIDOfTheLastInsertedServiceType };
            }

            const joinedData = await this.dataSource.query(
                `
                 SELECT 
                    sr.id as id,
                    sr.serviceId, sr.serviceSubTypeId,
                   bd.id as basicDetailsId, bd.aadharNumber, bd.panNumber,
                   inv.id as investmentId, inv.status, inv.activeSteps, inv.createdAt as investmentCreatedAt,
                   sst.ledgerType as serviceSubTypeName
                 FROM investmentdetails inv
                 INNER JOIN basicdetails bd ON inv.basicDetailsId = bd.id
                 INNER JOIN servicerequests sr ON inv.serviceRequestId = sr.id
                 INNER JOIN users u ON sr.userId = u.id
                 INNER JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                 WHERE inv.id = ?
                 `,
                [investmentId],
            );

            const finalData = joinedData[0];

            await this.serviceTypeMailService.emailCreateServiceTypeTemplates(
                user.email,
                dto.status,
                dto.serviceSubType,
            );

            const formattedSubType = dto.ServiceSubType.replace(/([a-z])([A-Z])/g, '$1 $2');
            const notificationPayload: CreateNotificationDTO = {
                message: `${ANew} <strong>${formattedSubType}</strong> ${serviceHasBeenCreatedByAUserAndRequiresYourAttention}`,
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
            const service = dto.activeSteps === 'basicDetails' ? 'Basic Details' : 'Investment Details';
            return {
                status: true,
                message: `${service} ${createdSuccessfully}`,
                data: finalData,
                notification: { message: yourServiceRequestHasBeenCreatedSuccessfully },
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeCreationError,
                error: error.message,
            };
        }
    }
}

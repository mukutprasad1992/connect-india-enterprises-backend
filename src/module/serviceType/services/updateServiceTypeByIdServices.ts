import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    serviceTypeNotFound,
    noValidFieldsProvidedForUpdate
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

    async getServiceTypeById(id: number): Promise<ServiceTypeSchema | null> {
        const serviceType = await this.dataSource.query(
            `SELECT u.id AS userId, u.email, s.serviceSubType
                                 FROM servicetypes s
                                 JOIN users u ON s.userId = u.id
                                 WHERE s.id = ?; `,
            [id]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }


    async updateServiceTypeById(id: number, userId: number, updateData: any): Promise<any> {
        try {
            const serviceTypeExists = await this.getServiceTypeById(id);
            if (!serviceTypeExists) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }
            const validUpdates = Object.entries(updateData)
                .filter(([_, value]) => value !== undefined && value !== null)
                .filter(([key, _]) => key !== 'id');

            if (validUpdates.length === 0) {
                return {
                    status: false,
                    message: noValidFieldsProvidedForUpdate,
                    data: null,
                };
            }
            const setClause = validUpdates
                .map(([key]) => `${key} = ?`)
                .join(', ');
            const values = [
                ...validUpdates.map(([_, value]) => value),
                userId,
                id
            ];

            await this.dataSource.query(
                `UPDATE servicetypes
             SET
                 ${setClause},
                 updatedAt = now(),
                 updatedBy = ?
             WHERE id = ?`,
                values
            );

            const updatedServiceType = await this.getServiceTypeById(id);
            const email = updatedServiceType?.email;
            const sendEmailToUser = await this.updateServiceTypeByUserMailService.emailCreateServiceTypeTemplates(
                email,
                updatedServiceType?.serviceSubType
            );
            // const message = this.updatedServiceMessageService.getMessageFromUpdatedService(updatedServiceType);

            const notificationPayload: CreateNotificationDTO = {
                message: `A  <strong>${updatedServiceType?.serviceSubType} </strong >service request has been updated by the user.`,
                userRoleId: 3,
                voucherId: null,
                isRead: false,
                createdBy: userId,
                updatedBy: userId,
                userId: userId,
                vendorId: null,
                isUser: 1
            };

            const notification = await this.createNotificationService.createNotification(notificationPayload);
            if (!notification) {
                return {
                    status: false,
                    message: notificationCreationFailed,
                };
            }

            return {
                message: serviceTypeUpdatedSuccessfully,
                status: true,
                data: updatedServiceType,
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

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceTypeDTO } from '../serviceTypeDTO/createServiceTypeDTO';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UserSchema } from '../../user/userEntity/userSchema';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { CreatedServiceSuccessMessageService } from '../common/template/serviceTypeCreatedNotificationMessagetemplate'
import {
    userNotFound,
    serviceTypeCreatedSuccessfully,
    serviceTypeCreationError,
    failedToRetrieveTheIDOfTheLastInsertedServiceType,
    yourServiceRequestHasBeenCreatedSuccessfully,
} from '../common/serviceTypeMessage';
import { errorWhileCreatingNotification, notificationCreationFailed } from '../../notificaton/common/notificationMessage';
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
            [id]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    async getUserById(userId: number): Promise<UserSchema | null> {
        const user = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return user.length > 0 ? user[0] : null;
    }

    private formatTimeTo24Hour(time: string): string {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':');

        if (modifier === 'PM' && hours !== '12') {
            hours = String(parseInt(hours, 10) + 12);
        } else if (modifier === 'AM' && hours === '12') {
            hours = '00';
        }
        return `${hours}:${minutes}:00`;
    }

    async createServiceType(userId: number, createServiceTypeDto: CreateServiceTypeDTO): Promise<any> {
        const { amount, serviceSubType, duration, status, comment, serviceId, fromTime, toTime } = createServiceTypeDto;
        const user = await this.getUserById(userId);

        if (!user) {
            return {
                status: false,
                message: userNotFound,
            };
        }

        const createdBy = userId;
        const formattedFromTime = this.formatTimeTo24Hour(fromTime);
        const formattedToTime = this.formatTimeTo24Hour(toTime);

        const query = `INSERT INTO servicetypes (userId, serviceId, createdBy, amount, serviceSubType, duration, status, fromTime, toTime, comment, createdAt)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())`;
        const values = [userId, serviceId, createdBy, amount, serviceSubType, duration, status, formattedFromTime, formattedToTime, comment || ""];

        try {
            await this.dataSource.query(query, values);
            const lastInserted = await this.dataSource.query("SELECT LAST_INSERT_ID() as id");
            const lastInsertedId = lastInserted[0]?.id;

            if (!lastInsertedId) {
                return {
                    status: false,
                    message: failedToRetrieveTheIDOfTheLastInsertedServiceType,
                };
            }
            const email = user.email
            const sendEmailToUser = await this.serviceTypeMailService.emailCreateServiceTypeTemplates(email, status, serviceSubType);
            const createdServiceType = await this.getServiceTypeById(lastInsertedId);
            const message = this.createdServiceSuccessMessageService.getMessageFromCreatedServiceType(createdServiceType);
            const notificationPayload: CreateNotificationDTO = {
                message: `${message}`,
                userRoleId: 3,
                voucherId: null,
                isRead: false,
                createdBy: userId,
                updatedBy: userId,
                userId: user.id,
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
                status: true,
                message: serviceTypeCreatedSuccessfully,
                data: createdServiceType,
                notification: {
                    message: yourServiceRequestHasBeenCreatedSuccessfully
                }
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

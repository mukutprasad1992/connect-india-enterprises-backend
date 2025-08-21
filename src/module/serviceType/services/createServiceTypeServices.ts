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
        const user = await this.getUserById(userId);

        if (!user) {
            return {
                status: false,
                message: userNotFound,
            };
        }
        const baseFields = {
            userId,
            createdBy: userId,
            createdAt: new Date(),
        };

        if (createServiceTypeDto.fromTime) {
            createServiceTypeDto.fromTime = this.formatTimeTo24Hour(createServiceTypeDto.fromTime);
        }
        if (createServiceTypeDto.toTime) {
            createServiceTypeDto.toTime = this.formatTimeTo24Hour(createServiceTypeDto.toTime);
        }
        const allFields = { ...baseFields, ...createServiceTypeDto };
        const columns = Object.keys(allFields).join(', ');
        const placeholders = Object.keys(allFields).map(() => '?').join(', ');
        const values = Object.values(allFields);

        const query = `INSERT INTO servicetypes (${columns}) VALUES (${placeholders})`;

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

            const email = user.email;
            const sendEmailToUser = await this.serviceTypeMailService.emailCreateServiceTypeTemplates(
                email,
                createServiceTypeDto.status,
                createServiceTypeDto.serviceSubType
            );

            const createdServiceType = await this.getServiceTypeById(lastInsertedId);
            // const message = this.createdServiceSuccessMessageService.getMessageFromCreatedServiceType(createdServiceType);

            const notificationPayload: CreateNotificationDTO = {
                message: ` A new <span class="highlight">${createdServiceType.serviceSubType}</span> service has created by a user and requires your attention.`,
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

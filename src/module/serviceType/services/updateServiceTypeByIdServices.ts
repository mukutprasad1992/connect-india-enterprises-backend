import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    serviceTypeNotFound
} from '../common/serviceTypeMessage';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UpdatedServiceMessageService } from '../common/template/serviceTypeUpdateNotificationMessageTemplate';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';

@Injectable()
export class UpdateServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly updatedServiceMessageService: UpdatedServiceMessageService,
    ) { }

    async getServiceTypeById(id: number): Promise<ServiceTypeSchema | null> {
        const serviceType = await this.dataSource.query(
            'SELECT * FROM servicetypes WHERE id = ?',
            [id]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
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

    async updateServiceTypeById(id: number, userId: number, updateData: any): Promise<any> {
        try {
            const { amount, duration, status, comment, fromTime, toTime } = updateData;
            const serviceTypeExists = await this.getServiceTypeById(id);
            if (!serviceTypeExists) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }

            const updatedBy = userId;
            const formattedFromTime = fromTime ? this.formatTimeTo24Hour(fromTime) : serviceTypeExists.fromTime;
            const formattedToTime = toTime ? this.formatTimeTo24Hour(toTime) : serviceTypeExists.toTime;

            await this.dataSource.query(
                `UPDATE servicetypes
                 SET amount = ?,
                     duration = ?,
                     status = ?,
                     comment = ?,
                     fromTime = ?,
                     toTime = ?,
                     updatedAt = now(),
                     updatedBy = ?
                 WHERE id = ?`,
                [amount, duration, status, comment, formattedFromTime, formattedToTime, updatedBy, id]
            );

            const updatedServiceType = await this.getServiceTypeById(id);
            const message = this.updatedServiceMessageService.getMessageFromUpdatedService(updatedServiceType);
            const notificationPayload: CreateNotificationDTO = {
                message: `${message}`,
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

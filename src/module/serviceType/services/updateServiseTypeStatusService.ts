import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateServiceTypeDTO } from '../serviceTypeDTO/updateServiceTypeDTO';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { NotificationMailService } from 'src/utils/mailer/notificatiomMail';
import { MessageGeneratorService } from '../common/template/serviceStatusMessageTemplate';
import {
    serviceTypeNotFound,
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    serviceTypeNotFoundOrNoChangesHaveBeenMade,
    invalidStatusValueProvided,
    userNotFoundForTheGivenServiceTypeID
} from '../common/serviceTypeMessage';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';


@Injectable()
export class UpdateServiceTypeStatusService {
    constructor(
        private readonly dataSource: DataSource,
        private NotificationMailService: NotificationMailService,
        private readonly createNotificationService: CreateNotificationService,
        private readonly messageGeneratorService: MessageGeneratorService
    ) { }

    async getServiceTypeById(id: number): Promise<ServiceTypeSchema | null> {
        const serviceType = await this.dataSource.query(
            'SELECT * FROM servicetypes WHERE id = ?',
            [id]
        );
        return serviceType.length > 0 ? serviceType[0] : null;
    }

    async updateServiceTypeStatus(id: number, updateData: UpdateServiceTypeDTO, userId: number): Promise<any> {
        try {
            const { status } = updateData;

            if (!['Approved', 'Rejected', 'In Progress', 'Pending'].includes(status)) {
                return {
                    status: false,
                    message: invalidStatusValueProvided,
                    data: null
                };
            }

            const serviceTypeExists = await this.getServiceTypeById(id);
            if (!serviceTypeExists) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null
                };
            }

            const query = `UPDATE servicetypes SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE id = ?`;
            const updateResult = await this.dataSource.query(query, [status, userId, id]);
            const userIdQuery = `SELECT u.id AS userId, u.email, s.serviceSubType
                                 FROM servicetypes s
                                 JOIN users u ON s.userId = u.id
                                 WHERE s.id = ?;`
            const getUserIdByServiceTypeId = await this.dataSource.query(userIdQuery, [id])
            if (!getUserIdByServiceTypeId) {
                return {
                    staus: false,
                    message: userNotFoundForTheGivenServiceTypeID
                }
            }
            const serviceRequiestUserId = getUserIdByServiceTypeId[0].userId
            const serviceSubType = getUserIdByServiceTypeId[0].serviceSubType
            function formatServiceSubType(serviceSubType: string): string {
                if (!serviceSubType) return '';

                // camelCase → "Mutual Fund"
                const spaced = serviceSubType.replace(/([a-z])([A-Z])/g, '$1 $2');

                // Capitalize each word
                const titleCase = spaced.replace(/\b\w/g, char => char.toUpperCase());

                // Wrap in <strong>
                return `<strong>${titleCase}</strong>`;
            }
            const getStatusMessage = (status: string, formattedServiceSubType: string) => {
                switch (status) {
                    case 'Approved':
                        return `The service request for ${formattedServiceSubType} has been approved.`;
                    case 'Rejected':
                        return `The service request for ${formattedServiceSubType} has been rejected.`;
                    case 'In Progress':
                        return `The service request for ${formattedServiceSubType} is currently in progress.`;
                    case 'Pending':
                        return `The service request for ${formattedServiceSubType} is pending.`;
                    default:
                        return '';
                }
            };

            const formattedServiceSubType = formatServiceSubType(serviceSubType);
            const message = getStatusMessage(status, formattedServiceSubType)
            if (updateResult) {
                const notificationPayload: CreateNotificationDTO = {
                    message: `${message}`,
                    userRoleId: 1,
                    voucherId: null,
                    isRead: false,
                    createdBy: userId,
                    updatedBy: userId,
                    userId: serviceRequiestUserId,
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
                const email = getUserIdByServiceTypeId[0].email;
                const sendEmailToUser = await this.NotificationMailService.sendNotificationEmail(email, status, serviceSubType);
            }
            if (updateResult.affectedRows === 0) {
                return {
                    status: false,
                    message: serviceTypeNotFoundOrNoChangesHaveBeenMade,
                    data: null
                };
            }
            return {
                status: true,
                message: serviceTypeUpdatedSuccessfully,
                data: {
                    id,
                    status,
                    updatedAt: new Date(),
                    updatedBy: userId
                }
            };

        }
        catch (error) {
            return {
                status: false,
                message: serviceTypeUpdateError,
                error: error.message
            };
        }
    }
}

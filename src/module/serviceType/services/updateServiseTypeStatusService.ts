import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { NotificationMailService } from 'src/utils/mailer/notificatiomMail';
import {
    serviceTypeNotFound,
    serviceTypeUpdateError,
    serviceTypeUpdatedSuccessfully,
    serviceTypeNotFoundOrNoChangesHaveBeenMade,
    invalidStatusValueProvided,
    userNotFoundForTheGivenServiceTypeID,
    theServiceRequestFor,
    hasBeenApproved,
    hasBeenRejected,
    isCurrentlyInProgress,
    isPending,
    tableNotFound,
    thisUsersFormIsIncompletePleaseAskTheUserToCompleteTheirFormBeforeUpdatingTheStatus,
    tableNotFoundForServiceId,
    resolvedTable,
    forServiceId,
    tableNotFoundWhileFetchingServiceTypeId,
    serviceTypeRecordFoundId,
    noRecordFoundForServiceRequestId,
    inTable,
    invalidStatusValue,
    providedByUserId,
    serviceTypeNotFoundForServiceRequestId,
    formIncompleteForServiceRequestId,
    updateQueryExecutedForServiceRequestId,
    newStatus,
    noUserFoundForServiceRequestId,
    notificationCreationFailedForServiceRequestId,
    notificationEmailSentSuccessfullyToUserId,
    noChangesMadeForServiceRequestId,
    serviceTypeStatusUpdatedSuccessfullyServiceRequestId,
    errorWhileUpdatingServiceTypeStatusServiceRequestId,
} from '../common/serviceTypeMessage';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { UpdateStatusServiceTypeDTO } from '../serviceTypeDTO/updateStatusInvestmentDTO';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateServiceTypeStatusService {
    constructor(
        private readonly dataSource: DataSource,
        private NotificationMailService: NotificationMailService,
        private readonly createNotificationService: CreateNotificationService,
        private readonly logger: AppLogger,
    ) { }

    private async getTableName(serviceId: number): Promise<string> {
        const tableMap: Record<number, string> = {
            1: 'investmentdetails',
            2: 'policedetails',
            3: 'insurancedetails',
            4: 'loandetails',
        };

        const table = tableMap[serviceId];
        if (!table) {
            this.logger.doLog(`${tableNotFoundForServiceId} = ${serviceId}`, 'fail');
            return null;
        }

        this.logger.doLog(`${resolvedTable} = ${table} ${forServiceId} = ${serviceId}`, 'success');
        return table;
    }

    private async getServiceTypeById(id: number, serviceId: number): Promise<any | null> {
        const table = await this.getTableName(serviceId);
        if (!table) {
            this.logger.doLog(`${tableNotFoundWhileFetchingServiceTypeId} = ${id} serviceId=${serviceId}`, 'fail');
            return {
                status: false,
                message: tableNotFound,
                data: null,
            };
        }
        const query = `SELECT * FROM ${table} WHERE serviceRequestId = ?`;
        const result = await this.dataSource.query(query, [id]);
        this.logger.doLog(
            result.length > 0
                ? `${serviceTypeRecordFoundId} = ${id} ${inTable} = ${table}`
                : `${noRecordFoundForServiceRequestId} = ${id} ${inTable} = ${table}`,
            result.length > 0 ? 'success' : 'fail'
        );
        return result.length > 0 ? result[0] : null;
    }

    async updateServiceTypeStatus(
        id: number,
        updateData: UpdateStatusServiceTypeDTO,
        userId: number,
        serviceId: number,
    ): Promise<any> {
        try {
            const { status } = updateData;
            if (!['Approved', 'Rejected', 'In Progress', 'Pending'].includes(status)) {
                this.logger.doLog(
                    `${invalidStatusValue} = ${status} ${providedByUserId} = ${userId}`,
                    'fail'
                );
                return {
                    status: false,
                    message: invalidStatusValueProvided,
                    data: null,
                };
            }

            const serviceTypeExists = await this.getServiceTypeById(id, serviceId);
            if (!serviceTypeExists) {
                this.logger.doLog(
                    `${serviceTypeNotFoundForServiceRequestId} = ${id}, serviceId=${serviceId}`,
                    'fail'
                );
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }

            if (serviceTypeExists.submit !== 1) {
                this.logger.doLog(
                    `${formIncompleteForServiceRequestId} = ${id}, userId=${userId}`,
                    'fail'
                );
                return {
                    status: false,
                    message: thisUsersFormIsIncompletePleaseAskTheUserToCompleteTheirFormBeforeUpdatingTheStatus,
                    data: null,
                };
            }

            const table = await this.getTableName(serviceId);
            if (!table) {
                return {
                    status: false,
                    message: tableNotFound,
                    data: null,
                };
            }

            const updateQuery = `UPDATE ${table} SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE serviceRequestId = ?`;
            const updateResult = await this.dataSource.query(updateQuery, [status, userId, id]);

            this.logger.doLog(
                `${updateQueryExecutedForServiceRequestId} = ${id}, ${newStatus} = ${status}, updatedBy=${userId}`,
                'success'
            );

            const userIdQuery = `
                SELECT sr.id, sr.userId, u.email, sst.ledgerType
                FROM ${table} s
                JOIN servicerequests sr ON s.serviceRequestId = sr.id
                JOIN users u ON sr.userId = u.id
                JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE s.serviceRequestId = ?;
            `;
            const getUserIdByServiceTypeId = await this.dataSource.query(userIdQuery, [id]);

            if (!getUserIdByServiceTypeId || getUserIdByServiceTypeId.length === 0) {
                this.logger.doLog(
                    `${noUserFoundForServiceRequestId} = ${id} serviceId=${serviceId}`,
                    'fail'
                );
                return {
                    status: false,
                    message: userNotFoundForTheGivenServiceTypeID,
                };
            }

            const serviceRequiestUserId = getUserIdByServiceTypeId[0].userId;
            const serviceSubType = getUserIdByServiceTypeId[0].ledgerType;

            function formatServiceSubType(serviceSubType: string): string {
                if (!serviceSubType) return '';
                const spaced = serviceSubType.replace(/([a-z])([A-Z])/g, '$1 $2');
                const titleCase = spaced.replace(/\b\w/g, (char) => char.toUpperCase());
                return `<strong>${titleCase}</strong>`;
            }

            const getStatusMessage = (status: string, formattedServiceSubType: string) => {
                switch (status) {
                    case 'Approved':
                        return `${theServiceRequestFor} ${formattedServiceSubType} ${hasBeenApproved}`;
                    case 'Rejected':
                        return `${theServiceRequestFor} ${formattedServiceSubType} ${hasBeenRejected}`;
                    case 'In Progress':
                        return `${theServiceRequestFor} ${formattedServiceSubType} ${isCurrentlyInProgress}`;
                    case 'Pending':
                        return `${theServiceRequestFor} ${formattedServiceSubType} ${isPending}`;
                    default:
                        return '';
                }
            };

            const formattedServiceSubType = formatServiceSubType(serviceSubType);
            const message = getStatusMessage(status, formattedServiceSubType);

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
                    isUser: 1,
                };
                const notification = await this.createNotificationService.createNotification(
                    notificationPayload,
                );

                if (!notification) {
                    this.logger.doLog(
                        `${notificationCreationFailedForServiceRequestId} = ${id}, userId=${serviceRequiestUserId}`,
                        'fail'
                    );
                    return {
                        status: false,
                        message: notificationCreationFailed,
                    };
                }

                const email = getUserIdByServiceTypeId[0].email;
                await this.NotificationMailService.sendNotificationEmail(email, status, serviceSubType);
                this.logger.doLog(
                    `${notificationEmailSentSuccessfullyToUserId} = ${serviceRequiestUserId}, status=${status}, email=${email}`,
                    'success'
                );
            }

            if (updateResult.affectedRows === 0) {
                this.logger.doLog(
                    `${noChangesMadeForServiceRequestId} = ${id}, userId=${userId}`,
                    'fail'
                );
                return {
                    status: false,
                    message: serviceTypeNotFoundOrNoChangesHaveBeenMade,
                    data: null,
                };
            }

            this.logger.doLog(
                `${serviceTypeStatusUpdatedSuccessfullyServiceRequestId} = ${id}, ${newStatus} = ${status}, updatedBy=${userId}`,
                'success'
            );

            return {
                status: true,
                message: serviceTypeUpdatedSuccessfully,
                data: {
                    id,
                    status,
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            };
        } catch (error) {
            this.logger.doLog(
                `${errorWhileUpdatingServiceTypeStatusServiceRequestId} = ${id}, userId=${userId}, error=${error.message}`,
                'fail'
            );
            return {
                status: false,
                message: serviceTypeUpdateError,
                error: error.message,
            };
        }
    }
}

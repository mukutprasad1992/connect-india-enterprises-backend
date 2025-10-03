import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateCustomerDTO } from '../customerDTO/updateCustomerDTO';
import { CustomerSchema } from '../customerEntity/customerEntity';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { UpdateNotificationCustomerService } from '../common/template/notificationUpdateCustomerMessage';
import {
    attemptingToUpdateCustomerId,
    byUserId,
    creatingNotificationForUpdatedCustomer,
    customerDetailsUpdatedByVendor,
    customerNotFound,
    customerRetrievedSuccessfully,
    customerUpdatedSuccessfully,
    customerUpdatedSuccessfullyInDB,
    customerUpdateNotificationCompletedSuccessfully,
    errorWhileUpdatingCustomer,
    failedToUpdateCustomer,
    noCustomerFoundToUpdate,
    notificationCreationFailedForCustomer,
} from '../common/customerMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateCustomerService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly updateNotificationCustomerService: UpdateNotificationCustomerService,
        private readonly logger: AppLogger,
    ) { }

    async getCustomerById(id: number): Promise<CustomerSchema | null> {
        this.logger.doLog(`Fetching customer by ID: ${id}`, 'info');
        const customer = await this.dataSource.query(
            ` SELECT 
                        c.*, u.BusinessRepresentative,
                        u.businessName
                    FROM 
                        customers c
                    LEFT JOIN 
                        users u ON u.id = c.vendorId
                    LEFT JOIN 
                        customers cu ON cu.id = c.id
                    WHERE 
                        c.id = ?;
        `,
            [id]
        );
        if (customer.length > 0) {
            this.logger.doLog(`${customerRetrievedSuccessfully} (ID: ${id})`, 'success');
            return customer[0];
        } else {
            this.logger.doLog(`${customerNotFound} (ID: ${id})`, 'warn');
            return null;
        }
    }

    async updateCustomer(userId: number, id: number, updateCustomerDTO: UpdateCustomerDTO): Promise<any> {
        this.logger.doLog(`${attemptingToUpdateCustomerId} ${id} ${byUserId} ${userId})`, 'info');

        const { name, address, phone, email, pincode } = updateCustomerDTO;
        const updatedBy = userId;
        const vendorId = userId;
        const query = `
            UPDATE customers
        SET
            name = ?,
            address = ?,
            phone = ?,
            email = ?,
            pincode = ?,
            vendorId = ?,
            updatedBy = ?,
            updatedAt = now() 
        WHERE id = ? `;
        const values = [name, address, phone, email, pincode, vendorId, updatedBy, id];

        try {
            const result = await this.dataSource.query(query, values);

            if (result.affectedRows === 0) {
                this.logger.doLog(`${noCustomerFoundToUpdate} (ID: ${id})`, 'warn');
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            this.logger.doLog(`${customerUpdatedSuccessfullyInDB} (ID: ${id})`, 'success');

            const updatedCustomer = await this.getCustomerById(id);

            const BusinessRepresentative = updatedCustomer?.BusinessRepresentative;
            const notificationPayload: CreateNotificationDTO = {
                message: `${customerDetailsUpdatedByVendor} ${BusinessRepresentative} `,
                userRoleId: 2,
                voucherId: null,
                isRead: false,
                userId: userId,
                vendorId: vendorId,
                createdBy: userId,
                isUser: 0,
            };

            this.logger.doLog(`${creatingNotificationForUpdatedCustomer} (ID: ${id})`, 'info');
            const notification = await this.createNotificationService.createNotification(notificationPayload);

            if (!notification) {
                this.logger.doLog(`${notificationCreationFailedForCustomer} (ID: ${id})`, 'error');
                return {
                    status: false,
                    message: notificationCreationFailed,
                };
            }

            this.logger.doLog(`${customerUpdateNotificationCompletedSuccessfully} (ID: ${id})`, 'success');
            return {
                status: true,
                message: customerUpdatedSuccessfully,
                data: updatedCustomer,
            };
        } catch (error) {
            this.logger.doLog(
                `${errorWhileUpdatingCustomer} (ID: ${id}) by user (ID: ${userId}) - ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: failedToUpdateCustomer,
                error: error.message,
            };
        }
    }
}

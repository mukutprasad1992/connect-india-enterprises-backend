import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateCustomerDTO } from '../customerDTO/updateCustomerDTO';
import { CustomerSchema } from '../customerEntity/customerEntity';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { UpdateNotificationCustomerService } from '../common/template/notificationUpdateCustomerMessage'
import {
    customerNotFound,
    customerUpdatedSuccessfully,
    failedToUpdateCustomer,
} from '../common/customerMessage';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';

@Injectable()
export class UpdateCustomerService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly updateNotificationCustomerService: UpdateNotificationCustomerService
    ) { }

    async getCustomerById(id: number): Promise<CustomerSchema | null> {
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
        return customer.length > 0 ? customer[0] : null;
    }

    async updateCustomer(userId: number, id: number, updateCustomerDTO: UpdateCustomerDTO): Promise<any> {
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
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            const updatedCustomer = await this.getCustomerById(id);
            const message = await this.updateNotificationCustomerService.sendCustomerDetailsNotification(updatedCustomer);
            const notificationPayload: CreateNotificationDTO = {
                message: `${message} `,
                userRoleId: 2,
                voucherId: null,
                isRead: false,
                userId: userId,
                vendorId: vendorId,
                createdBy: userId,
                isUser: 0
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
                message: customerUpdatedSuccessfully,
                data: updatedCustomer,
            };
        } catch (error) {
            return {
                status: false,
                message: failedToUpdateCustomer,
                error: error.message,
            };
        }
    }
}


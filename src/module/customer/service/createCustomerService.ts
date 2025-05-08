import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateCustomerDTO } from '../customerDTO/createCustomerDTO';
import { CustomerSchema } from '../customerEntity/customerEntity';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import {
    customerCreatedSuccessfully,
    customerCreationError,
    failedToRetrieveTheIDOfTheLastInsertedCustomer,
    customerNotFound,
    customerWithThisEmailAlreadyExists,
    vendorNotFound,
} from '../common/customerMessage';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';
import { NotificationCustomerService } from '../common/template/notificationCreateCustomerMessageTemelate';


@Injectable()
export class CreateCustomerService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly notificationCustomerService: NotificationCustomerService,
    ) { }
    async getCustomerById(id: number): Promise<CustomerSchema | null> {
        const customer = await this.dataSource.query(
            `SELECT 
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
    async createCustomer(userId: number, createCustomerDto: CreateCustomerDTO): Promise<any> {
        const { name, address, phone, email, pincode } = createCustomerDto;
        const createdBy = userId;
        const vendorId = userId;
        const existingCustomer = await this.getCustomerByEmail(email);
        if (existingCustomer) {
            return {
                status: false,
                message: customerWithThisEmailAlreadyExists,
            };
        }
        const vendor = await this.getVendorById(vendorId);
        if (!vendor) {
            return {
                status: false,
                message: vendorNotFound,
            };
        }
        const query = `INSERT INTO customers (name, address, phone, email, pincode, vendorId,createdBy, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, now())`;
        const values = [name, address, phone, email, pincode, vendorId, createdBy];
        try {
            const response = await this.dataSource.query(query, values);
            if (response) {
                const lastInserted = await this.dataSource.query('SELECT LAST_INSERT_ID() as id');
                const lastInsertedId = lastInserted[0]?.id;
                if (!lastInsertedId) {
                    return {
                        status: false,
                        message: failedToRetrieveTheIDOfTheLastInsertedCustomer,
                    };
                }
                const createdCustomer = await this.getCustomerById(lastInsertedId);
                const message = await this.notificationCustomerService.sendCustomerDetailsNotification(createdCustomer);
                const notificationPayload: CreateNotificationDTO = {
                    message: `${message}`,
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
                    message: customerCreatedSuccessfully,
                    data: createdCustomer,
                };
            }
            else {
                return {
                    status: false,
                    message: customerCreationError,
                };
            }

        } catch (error) {
            return {
                status: false,
                message: customerCreationError,
                error: error.message,
            };
        }
    }
    async getCustomerByEmail(email: string): Promise<CustomerSchema | null> {
        const customer = await this.dataSource.query(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );
        return customer.length > 0 ? customer[0] : null;
    }
    async getVendorById(vendorId: number): Promise<any> {
        const vendor = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [vendorId]
        );
        return vendor.length > 0 ? vendor[0] : null;
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateCustomerDTO } from '../customerDTO/createCustomerDTO';
import { CustomerSchema } from '../customerEntity/customerEntity';
import { CreateNotificationDTO } from '../../notificaton/notificationDTO/createNotificationDTO';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { NotificationCustomerService } from '../common/template/notificationCreateCustomerMessageTemelate';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    customerCreatedSuccessfully,
    customerCreationError,
    failedToRetrieveTheIDOfTheLastInsertedCustomer,
    customerWithThisEmailAlreadyExists,
    vendorNotFound,
    newCustomerCreatedForVendor,
    fetchingCustomerByID,
    customerFetched,
    attemptingToCreateCustomer,
    customerWithEmail,
    alreadyExists,
    vendorNotFoundForID,
    customerInsertQueryExecuted,
    failedToRetrieveLastInsertedCustomerID,
    notificationCreationFailedForCustomerID,
    customerCreateSuccessfullyWithID,
    customerCreationQueryFailed,
    errorCreatingCustomer,
    checkingIfCustomerExistsWithEmail,
    fetchingVendorByID,
} from '../common/customerMessage';
import { notificationCreationFailed } from 'src/module/notificaton/common/notificationMessage';

@Injectable()
export class CreateCustomerService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly createNotificationService: CreateNotificationService,
        private readonly notificationCustomerService: NotificationCustomerService,
        private readonly logger: AppLogger,
    ) { }

    async getCustomerById(id: number): Promise<CustomerSchema | null> {
        this.logger.doLog(`${fetchingCustomerByID} ${id}`, 'info');
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
                        c.id = ?;`,
            [id]
        );
        this.logger.doLog(`${customerFetched} ${customer.length > 0 ? 'found' : 'not found'}`, customer.length > 0 ? 'success' : 'warn');
        return customer.length > 0 ? customer[0] : null;
    }

    async createCustomer(userId: number, createCustomerDto: CreateCustomerDTO): Promise<any> {
        const { name, address, phone, email, pincode } = createCustomerDto;
        const createdBy = userId;
        const vendorId = userId;

        this.logger.doLog(`${attemptingToCreateCustomer} ${email}`, 'info');

        const existingCustomer = await this.getCustomerByEmail(email);
        if (existingCustomer) {
            this.logger.doLog(`${customerWithEmail} ${email} ${alreadyExists}`, 'warn');
            return {
                status: false,
                message: customerWithThisEmailAlreadyExists,
            };
        }

        const vendor = await this.getVendorById(vendorId);
        if (!vendor) {
            this.logger.doLog(`${vendorNotFoundForID} ${vendorId}`, 'warn');
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
            this.logger.doLog(`${customerInsertQueryExecuted}`, 'info');

            if (response) {
                const lastInserted = await this.dataSource.query('SELECT LAST_INSERT_ID() as id');
                const lastInsertedId = lastInserted[0]?.id;

                if (!lastInsertedId) {
                    this.logger.doLog(`${failedToRetrieveLastInsertedCustomerID}`, 'error');
                    return {
                        status: false,
                        message: failedToRetrieveTheIDOfTheLastInsertedCustomer,
                    };
                }

                const createdCustomer = await this.getCustomerById(lastInsertedId);
                const BusinessRepresentative = vendor.BusinessRepresentative;

                const notificationPayload: CreateNotificationDTO = {
                    message: `${newCustomerCreatedForVendor} ${BusinessRepresentative}`,
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
                    this.logger.doLog(`${notificationCreationFailedForCustomerID} ${lastInsertedId}`, 'warn');
                    return {
                        status: false,
                        message: notificationCreationFailed,
                    };
                }

                this.logger.doLog(`${customerCreateSuccessfullyWithID} ${lastInsertedId}`, 'success');
                return {
                    status: true,
                    message: customerCreatedSuccessfully,
                    data: createdCustomer,
                };
            }
            else {
                this.logger.doLog(`${customerCreationQueryFailed}`, 'error');
                return {
                    status: false,
                    message: customerCreationError,
                };
            }

        } catch (error) {
            this.logger.doLog(`${errorCreatingCustomer} ${error.message}`, 'error');
            return {
                status: false,
                message: customerCreationError,
                error: error.message,
            };
        }
    }

    async getCustomerByEmail(email: string): Promise<CustomerSchema | null> {
        this.logger.doLog(`${checkingIfCustomerExistsWithEmail} ${email}`, 'info');
        const customer = await this.dataSource.query('SELECT * FROM customers WHERE email = ?', [email]);
        return customer.length > 0 ? customer[0] : null;
    }

    async getVendorById(vendorId: number): Promise<any> {
        this.logger.doLog(`${fetchingVendorByID} ${vendorId}`, 'info');
        const vendor = await this.dataSource.query('SELECT * FROM users WHERE id = ?', [vendorId]);
        return vendor.length > 0 ? vendor[0] : null;
    }
}

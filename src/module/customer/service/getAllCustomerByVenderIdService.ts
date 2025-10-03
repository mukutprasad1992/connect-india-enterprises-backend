import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileFetchingCustomers,
    customerNotFound,
    customersRetrievedSuccessfully,
    customersRetrievedSuccessfullyForVendorId,
    errorFetchingCustomersForVendorId,
    errorFetchingVendorById,
    fetchingCustomersForVendorId,
    fetchingVendorById,
    noCustomersFoundForVendorId,
    vendorFoundWithId,
    vendorNotFound,
    vendorNotFoundWithId,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllCustomersByVenderIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getAllCustomersByVendorId(vendorId: number): Promise<any> {
        this.logger.doLog(`${fetchingCustomersForVendorId} = ${vendorId}`, 'info');

        try {
            const vendor = await this.getVendorById(vendorId);
            if (!vendor) {
                this.logger.doLog(`${vendorNotFoundWithId} = ${vendorId}`, 'warn');
                return {
                    status: false,
                    message: vendorNotFound,
                };
            }

            const query = `SELECT c.id, c.name, c.address, c.phone, c.email, c.pincode 
                     FROM customers c 
                     WHERE c.vendorId = ? 
                     ORDER BY id DESC`;

            const customers = await this.dataSource.query(query, [vendorId]);

            if (customers.length === 0) {
                this.logger.doLog(`${noCustomersFoundForVendorId} = ${vendorId}`, 'warn');
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            this.logger.doLog(
                `${customersRetrievedSuccessfullyForVendorId} = ${vendorId}, count=${customers.length}`,
                'success',
            );
            return {
                status: true,
                message: customersRetrievedSuccessfully,
                data: customers,
            };
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingCustomersForVendorId} = ${vendorId}: ${error.message}`,
                'error',
            );
            return {
                status: false,
                message: anErrorOccurredWhileFetchingCustomers,
                error: error.message,
            };
        }
    }

    private async getVendorById(vendorId: number): Promise<any> {
        this.logger.doLog(`${fetchingVendorById} = ${vendorId}`, 'info');
        try {
            const vendor = await this.dataSource.query(
                'SELECT * FROM users WHERE id = ?',
                [vendorId],
            );
            this.logger.doLog(
                vendor.length > 0
                    ? `${vendorFoundWithId} = ${vendorId}`
                    : `${vendorNotFoundWithId} = ${vendorId}`,
                vendor.length > 0 ? 'success' : 'warn',
            );
            return vendor.length > 0 ? vendor[0] : null;
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingVendorById} = ${vendorId}: ${error.message}`,
                'error',
            );
            return {
                status: false,
                message: errorFetchingVendorById,
            };
        }
    }
}

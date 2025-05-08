import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileFetchingCustomers,
    customerNotFound,
    customersRetrievedSuccessfully,
    errorFetchingVendorById,
    vendorNotFound,
} from '../common/customerMessage';

@Injectable()
export class GetAllCustomersByVenderService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllCustomersByVendor(vendorId: number): Promise<any> {
        try {
            const vendor = await this.getVendorById(vendorId);
            if (!vendor || Object.keys(vendor).length === 0) {
                return {
                    status: false,
                    message: vendorNotFound,
                };
            }

            const customers = await this.dataSource.query(
                'SELECT * FROM customers WHERE vendorId = ?',
                [vendorId]
            );
            if (!customers || customers.length === 0) {
                return {
                    status: false,
                    message: customerNotFound,
                    data: null,
                };
            }

            return {
                status: true,
                message: customersRetrievedSuccessfully,
                data: customers,
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileFetchingCustomers,
                error: error.message,
            };
        }
    }

    private async getVendorById(vendorId: number): Promise<any> {
        try {
            const vendor = await this.dataSource.query(
                'SELECT * FROM users WHERE id = ?',
                [vendorId]
            );
            return vendor && vendor.length > 0 ? vendor[0] : null;
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileFetchingCustomers,
                error: error.message,
            };
        }
    }
}

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
export class GetAllCustomerService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllCustomer(): Promise<any> {
        try {
            const customers = await this.dataSource.query(
                'SELECT * FROM customers;'
            );

            if (customers.length === 0) {
                return {
                    status: false,
                    message: customerNotFound,
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
                error: error.message
            };
        }
    }
}

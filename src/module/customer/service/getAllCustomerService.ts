import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileFetchingCustomers,
    customerNotFound,
    customersRetrievedSuccessfully,
    vendorNotFound,
} from '../common/customerMessage';

@Injectable()
export class GetAllCustomerService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllCustomer(userId: number): Promise<any> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return {
                    status: false,
                    message: vendorNotFound,
                };
            }

            const { roleId } = user;

            const query = `
        SELECT 
          c.id, c.name, c.address, c.phone, c.email, c.pincode,
          u.businessName, u.businessRepresentative
        FROM customers c
        JOIN users u ON c.vendorId = u.id
        ${roleId === 2 ? 'WHERE c.vendorId = ?' : ''}
      `;

            const customers = await this.dataSource.query(query, roleId === 2 ? [userId] : []);

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
                error: error.message,
            };
        }
    }

    private async getUserById(id: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                'SELECT roleId FROM users WHERE id = ?',
                [id]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            return null;
        }
    }
}

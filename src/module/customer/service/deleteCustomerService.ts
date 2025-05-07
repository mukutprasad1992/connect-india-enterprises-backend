import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileDeletingCustomers,
    customerNotFound,
    customerSuccessfullyDeleted
} from '../common/customerMessage';

@Injectable()
export class DeleteCustomerByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async deleteCustomerById(id: number): Promise<any> {     
        try {
            const getCustomerById = await this.getCustomerById(id);
            if (!getCustomerById || getCustomerById.length === 0) {
                return {
                    status: false,
                    message: customerNotFound,
                };
            }
            const deleteCustomers = await this.dataSource.query(
                'DELETE FROM customers WHERE id = ?',
                [id]
            );

            if (deleteCustomers.affected === 0) {
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            return {
                status: true,
                message: customerSuccessfullyDeleted
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileDeletingCustomers,
                error: error.message
            };
        }
    }

    async getCustomerById(id: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                'SELECT * FROM customers WHERE id = ?',
                [id]
            );
            return result;
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileDeletingCustomers,
                error: error.message
            };
        }
    }
}

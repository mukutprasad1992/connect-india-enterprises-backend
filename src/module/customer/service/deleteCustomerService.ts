import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileDeletingCustomers,
    attemptingToDeleteCustomerWithID,
    customerDeletedSuccessfullyID,
    customerFetchResultForID,
    customerNotFound,
    customerNotFoundWithID,
    customerSuccessfullyDeleted,
    errorDeletingCustomerWithID,
    errorFetchingCustomerWithID,
    fetchingCustomerByID,
    noCustomerDeletedForID,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class DeleteCustomerByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async deleteCustomerById(id: number): Promise<any> {
        this.logger.doLog(`${attemptingToDeleteCustomerWithID} ${id}`, 'info');

        try {
            const customer = await this.getCustomerById(id);

            if (!customer || customer.length === 0) {
                this.logger.doLog(`${customerNotFoundWithID} ${id}`, 'warn');
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            const deleteResult = await this.dataSource.query(
                'DELETE FROM customers WHERE id = ?',
                [id],
            );
            if (!deleteResult || deleteResult.affectedRows === 0) {
                this.logger.doLog(`${noCustomerDeletedForID} ${id}`, 'warn');
                return {
                    status: false,
                    message: customerNotFound,
                };
            }

            this.logger.doLog(`${customerDeletedSuccessfullyID} ${id}`, 'success');
            return {
                status: true,
                message: customerSuccessfullyDeleted,
            };
        } catch (error) {
            this.logger.doLog(
                `${errorDeletingCustomerWithID} ${id}: ${error.message}`,
                'error',
            );
            return {
                status: false,
                message: anErrorOccurredWhileDeletingCustomers,
                error: error.message,
            };
        }
    }

    async getCustomerById(id: number): Promise<any> {
        this.logger.doLog(`${fetchingCustomerByID} ${id}`, 'info');

        try {
            const result = await this.dataSource.query(
                'SELECT * FROM customers WHERE id = ?',
                [id],
            );

            this.logger.doLog(
                `${customerFetchResultForID} ${id}: ${result.length > 0 ? 'found' : 'not found'
                }`,
                result.length > 0 ? 'success' : 'warn',
            );

            return result;
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingCustomerWithID} ${id}: ${error.message}`,
                'error',
            );
            return {
                status: false,
                message: anErrorOccurredWhileDeletingCustomers,
                error: error.message,
            };
        }
    }
}

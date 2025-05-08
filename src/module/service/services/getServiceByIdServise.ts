import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceNotFound,
    serviceRetrievalError,
    serviceRetrievedSuccessfully
} from '../common/serviceMessage';

@Injectable()
export class GetServiceByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getServiceById(id: number): Promise<any> {
        try {
            const service = await this.dataSource.query(
                'SELECT * FROM services WHERE id = ?',
                [id]
            );

            if (service.length === 0) {
                return {
                    status: false,
                    message: serviceNotFound,
                };
            }

            return {
                message: serviceRetrievedSuccessfully,
                status: true,
                data: service[0],
            };
        } catch (error) {
            return {
                status: false,
                message: serviceRetrievalError,
                error: error.message,
            };
        }
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully
} from '../common/serviceTypeMessage';

@Injectable()
export class GetServiceTypeByServiceIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getServiceTypeByServiceId(id: number, userId: number): Promise<any> {
        try {
            const serviceType = await this.dataSource.query(
                'SELECT * FROM servicetypes WHERE serviceId = ? AND userId = ?',
                [id, userId]
            );

            if (serviceType.length === 0) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }

            return {
                message: serviceTypeRetrievedSuccessfully,
                status: true,
                data: serviceType,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            };
        }
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully
} from '../common/serviceTypeMessage';

@Injectable()
export class GetServiceTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getServiceTypeById(id: number): Promise<any> {
        try {
            const serviceType = await this.dataSource.query(
                'SELECT * FROM servicetypes WHERE serviceId = ?',
                [id]
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
                data: serviceType[0],
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

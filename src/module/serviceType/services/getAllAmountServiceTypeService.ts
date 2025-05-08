import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    noTotalAmountFound,
    serviceTypeTotalAmountRetrievalError,
    serviceTypeTotalAmountRetrievedSuccessfully
} from '../common/serviceTypeMessage';

@Injectable()
export class GetTotalAmountServiceTypeService {
    constructor(private readonly dataSource: DataSource) { }

    private async fetchTotalAmountByServiceId(serviceId: number): Promise<number | null> {
        const query = `SELECT 
                  SUM(amount) AS totalAmount,
                                COUNT(*) AS totalServices
                FROM 
                  servicetypes
                WHERE 
                  serviceId = ? `;
        const result = await this.dataSource.query(query, [serviceId]);
        return result[0];
    }
    async getTotalAmountServiceType(serviceId: number): Promise<any> {
        try {
            const response = await this.fetchTotalAmountByServiceId(serviceId);
            if (response === null) {
                return {
                    status: false,
                    message: noTotalAmountFound,
                };
            }
            return {
                status: true,
                message: serviceTypeTotalAmountRetrievedSuccessfully,
                data: response
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeTotalAmountRetrievalError,
                error: error.message,
            };
        }
    }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeTotalAmountRetrievalError,
    serviceTypeTotalAmountRetrievedSuccessfully
} from '../common/serviceTypeMessage';

@Injectable()
export class GetTotalAmountByUserIdServiceTypeService {
    constructor(private readonly dataSource: DataSource) { }

    async getTotalAmountServiceTypeById(serviceId: number, userId: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                `SELECT 
                  SUM(amount) AS totalAmount,
                                COUNT(*) AS totalServices
                FROM 
                  servicetypes
                WHERE 
                  serviceId = ? AND userId = ? `,
                [userId, serviceId]
            );
            if (!result[0]?.totalAmount && result[0]?.totalServices) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }

            return {
                message: serviceTypeTotalAmountRetrievedSuccessfully,
                status: true,
                data: {
                    totalAmount: result[0].totalAmount,
                    totalServices: result[0]?.totalServices
                }
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

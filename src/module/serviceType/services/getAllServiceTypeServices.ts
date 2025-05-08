import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeRetrievalError,
    serviceTypesRetrievedSuccessfully
} from '../common/serviceTypeMessage';
@Injectable()
export class GetALLServiceTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }
    async getAllServiceTypesByUser(): Promise<any> {
        try {
            const serviceTypes = await this.dataSource.query(
                `SELECT s.*, u.email , u.mobileNo  
                 FROM servicetypes s 
                 LEFT JOIN users u ON u.id = s.userId; `,
            );
            return {
                message: serviceTypesRetrievedSuccessfully,
                status: true,
                data: serviceTypes,
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
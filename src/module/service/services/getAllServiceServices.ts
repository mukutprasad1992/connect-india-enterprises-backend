import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceNotFound,
    serviceRetrievalError,
    servicesRetrievedSuccessfully
} from '../common/serviceMessage';
@Injectable()
export class GetALLServiceByIdmentService {
    constructor(private readonly dataSource: DataSource) { }
    async getAllServicesByUser(): Promise<any> {
        try {
            const services = await this.dataSource.query(
                'SELECT * FROM services',
            );
            if (services.length === 0) {
                return {
                    status: false,
                    message: serviceNotFound,
                    data: null
                }
            }
            else {
                return {
                    message: servicesRetrievedSuccessfully,
                    status: true,
                    data: services,
                }
            }
        } catch (error) {
            return {
                status: false,
                message: serviceRetrievalError,
                error: error.message,
            };
        }
    }
}
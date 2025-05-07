import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceNotFoundOrNoChangesMade,
    serviceUpdateError,
    serviceUpdatedSuccessfully,
    serviceNotFound
} from '../common/serviceMessage';
import { ServiceSchema } from '../serviceEntity/serviceEntity';

@Injectable()
export class UpdateServiceByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getServiceById(id: number): Promise<ServiceSchema | null> {
        const Service = await this.dataSource.query(
            'SELECT * FROM services WHERE id = ?',
            [id]
        );
        return Service.length > 0 ? Service[0] : null;
    }
    async updateServiceById(id: number, userId: number, updateData: any): Promise<any> {
        try {
            const { serviceType } = updateData;
            const serviceExists = await this.getServiceById(id);
            if (!serviceExists) {
                return {
                    status: false,
                    message: serviceNotFound,
                    data: null,
                };
            }

            const updatedBy = userId;
            const result = await this.dataSource.query(
                `UPDATE services
             SET serviceType = ?, updatedAt = now(), updatedBy = ?
             WHERE id = ?`,
                [serviceType, updatedBy, id]
            );

            const updatedService = await this.getServiceById(id);

            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: serviceNotFoundOrNoChangesMade,
                    data: null,
                };
            }
            return {
                message: serviceUpdatedSuccessfully,
                status: true,
                data: updatedService,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceUpdateError,
                error: error.message,
            };
        }
    }

}

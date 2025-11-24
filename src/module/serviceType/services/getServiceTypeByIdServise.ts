import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    errorRetrievingServiceTypeId,
    fetchingServiceTypeById,
    serviceTypeNotFound,
    serviceTypeNotFoundId,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
    serviceTypeRetrievedSuccessfullyId,
} from '../common/serviceTypeMessage';

@Injectable()
export class GetServiceTypeByIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getServiceTypeById(id: number): Promise<any> {
        this.logger.doLog(`${fetchingServiceTypeById} ${id}`, 'success');

        try {
            const serviceType = await this.dataSource.query(
                `SELECT id, serviceId, status, createdAt, updatedAt
                 FROM servicetypes WHERE serviceId = ? LIMIT 1`,
                [id],
            );

            if (!serviceType || serviceType.length === 0) {
                this.logger.doLog(`${serviceTypeNotFoundId} ${id}`, 'fail');
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }

            this.logger.doLog(
                `${serviceTypeRetrievedSuccessfullyId} ${id}`,
                'success',
            );
            return {
                status: true,
                message: serviceTypeRetrievedSuccessfully,
                data: serviceType[0],
            };
        } catch (error) {
            this.logger.doLog(
                `${errorRetrievingServiceTypeId} ${id}. Error: ${error.message}`,
                'fail',
            );
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
                data: null,
            };
        }
    }
}

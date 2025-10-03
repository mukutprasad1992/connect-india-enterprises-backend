import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    errorRetrievingTotalAmountForServiceId,
    fetchingTotalAmountTotalServicesForServiceId,
    noRecordsFoundForServiceId,
    serviceTypeNotFound,
    serviceTypeTotalAmountRetrievalError,
    serviceTypeTotalAmountRetrievedSuccessfully,
    totalAmountTotalServicesRetrievedSuccessfullyForServiceId,
} from '../common/serviceTypeMessage';

@Injectable()
export class GetTotalAmountByUserIdServiceTypeService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getTotalAmountServiceTypeById(serviceId: number, userId: number): Promise<any> {
        this.logger.doLog(
            `${fetchingTotalAmountTotalServicesForServiceId} ${serviceId}, userId: ${userId}`,
            'success',
        );

        try {
            const result = await this.dataSource.query(
                `SELECT 
                    SUM(amount) AS totalAmount,
                    COUNT(*) AS totalServices
                 FROM servicetypes
                 WHERE serviceId = ? AND userId = ?`,
                [serviceId, userId],
            );

            if (!result[0]?.totalAmount && result[0]?.totalServices) {
                this.logger.doLog(
                    `${noRecordsFoundForServiceId} ${serviceId}, userId: ${userId}`,
                    'fail',
                );
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }

            this.logger.doLog(
                `${totalAmountTotalServicesRetrievedSuccessfullyForServiceId} ${serviceId}, userId: ${userId}`,
                'success',
            );

            return {
                status: true,
                message: serviceTypeTotalAmountRetrievedSuccessfully,
                data: {
                    totalAmount: result[0].totalAmount,
                    totalServices: result[0].totalServices,
                },
            };
        } catch (error) {
            this.logger.doLog(
                `${errorRetrievingTotalAmountForServiceId} ${serviceId}, userId: ${userId}. Error: ${error.message}`,
                'fail',
            );

            return {
                status: false,
                message: serviceTypeTotalAmountRetrievalError,
                error: error.message,
                data: null,
            };
        }
    }
}

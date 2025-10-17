import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceSubTypeRetrievalSuccessfully,
    anErrorOccurredWhileRetrievingServiceSubType,
    serviceSubTypeNotFound,
    fetchingAllServiceSubTypes,
    noServiceSubTypesFound,
    serviceSubTypesRetrievedSuccessfullyCount,
    errorFetchingServiceSubTypes
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllServiceSubTypeService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger
    ) { }

    async getAllServiceSubType(): Promise<any> {
        this.logger.doLog(fetchingAllServiceSubTypes, 'info');

        try {
            const serviceSubType = await this.dataSource.query('SELECT * FROM serviceSubTypes');

            if (!serviceSubType[0]) {
                this.logger.doLog(noServiceSubTypesFound, 'warn');
                return {
                    status: false,
                    message: serviceSubTypeNotFound,
                    data: null
                };
            } else {
                this.logger.doLog(
                    `${serviceSubTypesRetrievedSuccessfullyCount} ${serviceSubType.length}`,
                    'success'
                );
                return {
                    status: true,
                    message: serviceSubTypeRetrievalSuccessfully,
                    data: serviceSubType
                };
            }

        } catch (error) {
            this.logger.doLog(
                `${errorFetchingServiceSubTypes} ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                error: error.message
            };
        }
    }
}

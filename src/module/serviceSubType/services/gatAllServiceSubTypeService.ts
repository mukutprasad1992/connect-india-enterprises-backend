import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceSubTypeRetrievalSuccessfully,
    anErrorOccurredWhileRetrievingServiceSubType,
    serviceSubTypeNotFound
} from '../common/serviceSubTypeMessage';
@Injectable()
export class GetAllServiceSubTypeService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllServiceSubType(): Promise<any> {
        try {
            const serviceSubType = await this.dataSource.query('SELECT * FROM serviceSubTypes');
            if (!serviceSubType[0]) {
                return {
                    status: false,
                    message: serviceSubTypeNotFound,
                    data: null
                };
            } else {
                return {
                    status: true,
                    message: serviceSubTypeRetrievalSuccessfully,
                    data: serviceSubType
                };
            }

        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                error: error.message
            };
        }
    }
}
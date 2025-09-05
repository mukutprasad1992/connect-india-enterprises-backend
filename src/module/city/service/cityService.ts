import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    CityResponseRetrievedSuccessfully,
    failedToGetCityResponse,
    noCitiesFound,
} from '../common/cityMessage'
@Injectable()
export class CityService {
    constructor(private readonly dataSource: DataSource) { }

    async getCityResponse(): Promise<any> {
        try {
            const cities = await this.dataSource.query('SELECT * FROM cities');

            if (!cities || cities.length === 0) {
                return {
                    status: false,
                    message: noCitiesFound,
                    data: [],
                };
            }

            return {
                status: true,
                message: CityResponseRetrievedSuccessfully,
                data: cities,
            };
        } catch (error: any) {
            return {
                status: false,
                message: failedToGetCityResponse,
                error: error.message,
            };
        }
    }
}

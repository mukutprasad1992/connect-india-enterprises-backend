import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    citiesSuccessfully,
    CityResponseRetrievedSuccessfully,
    errorFetchingCities,
    failedToGetCityResponse,
    fetchingCityResponseStarted,
    noCitiesFound,
    noCitiesFoundInDatabase,
} from '../common/cityMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class CityService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getCityResponse(): Promise<any> {
        this.logger.doLog(fetchingCityResponseStarted, 'success');

        try {
            const cities = await this.dataSource.query('SELECT * FROM cities');

            if (!cities || cities.length === 0) {
                this.logger.doLog(noCitiesFoundInDatabase, 'fail');
                return {
                    status: false,
                    message: noCitiesFound,
                    data: [],
                };
            }

            this.logger.doLog(`Fetched ${cities.length} ${citiesSuccessfully}`, 'success');
            return {
                status: true,
                message: CityResponseRetrievedSuccessfully,
                data: cities,
            };
        } catch (error: any) {
            this.logger.doLog(`${errorFetchingCities} ${error.message}`, 'fail');
            return {
                status: false,
                message: failedToGetCityResponse,
                error: error.message,
            };
        }
    }
}

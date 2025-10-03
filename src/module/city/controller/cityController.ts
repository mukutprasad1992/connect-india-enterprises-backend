import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CityService } from '../service/cityService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { citiesRetrievedSuccessfully, cityControllerGetCityCalled, errorFetchingCities, noCitiesFound } from '../common/cityMessage';

@Controller('city')
export class CityController {
    constructor(
        private readonly cityService: CityService,
        private readonly logger: AppLogger,
    ) { }

    @UseGuards(AuthGuard)
    @Get('getCities')
    async getCity(@Res() res: Response) {
        this.logger.doLog(cityControllerGetCityCalled, 'success');

        try {
            const cityResponse = await this.cityService.getCityResponse();

            if (cityResponse.status) {
                this.logger.doLog(citiesRetrievedSuccessfully, 'success');
                return res.status(200).json(cityResponse);
            } else {
                this.logger.doLog(noCitiesFound, 'fail');
                return res.status(404).json(cityResponse);
            }
        } catch (error: any) {
            this.logger.doLog(`${errorFetchingCities} ${error.message}`, 'fail');
            return res.status(500).json({
                status: false,
                error: error.message,
                data: null,
            });
        }
    }
}

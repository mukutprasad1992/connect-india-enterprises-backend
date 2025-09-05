import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CityService } from '../service/cityService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('city')
export class CityController {
    constructor(private readonly cityService: CityService) { }

    @UseGuards(AuthGuard)
    @Get('getCities')
    async getCity(@Res() res: Response) {
        try {
            const cityResponse = await this.cityService.getCityResponse();

            if (cityResponse.status) {
                return res.status(200).json(cityResponse);
            } else {
                return res.status(404).json(cityResponse);
            }
        } catch (error: any) {
            return res.status(500).json({
                status: false,
                error: error.message,
                data: null,
            });
        }
    }
}

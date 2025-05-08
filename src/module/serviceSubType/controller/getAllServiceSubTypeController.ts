import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllServiceSubTypeService } from '../services/gatAllServiceSubTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { anErrorOccurredWhileRetrievingServiceSubType } from '../common/serviceSubTypeMessage';

@Controller('serviceSubType/getAllServiceSubTypes')
export class GetAllServiceSubTypeController {
    constructor(private readonly getAllServiceSubTypeService: GetAllServiceSubTypeService) { }

    @UseGuards(AuthGuard)
    @Get()
    async GetAllServiceSubType(@Res() res, @Req() req) {
        try {
            const serviceSubTypeResponse = await this.getAllServiceSubTypeService.getAllServiceSubType();

            if (serviceSubTypeResponse.status === true) {
                return res.status(200).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: serviceSubTypeResponse.message,
                    error: serviceSubTypeResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                error: error.message
            });
        }
    }
}

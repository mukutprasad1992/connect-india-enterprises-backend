import { Controller, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { anErrorOccurredWhileRetrievingServiceSubType } from '../common/serviceSubTypeMessage';
import { GetServiceSubTypeByServiceIdService } from '../services/getAllServiceSubTypeByServiceIdService';

@Controller('serviceSubType/getServiceSubTypeByServiceId/:serviceId')
export class GetServiceSubTypeByServiceIdController {
    constructor(private readonly getServiceSubTypeByServiceIdService: GetServiceSubTypeByServiceIdService) { }
    @UseGuards(AuthGuard)
    @Get()
    async getProfile(@Param('serviceId') serviceId: number, @Req() req, @Res() res) {
        try {
            const userId = req.user.id;

            const serviceSubTypeResponse = await this.getServiceSubTypeByServiceIdService.getServiceSubTypeByServiceId(serviceId);

            if (serviceSubTypeResponse.status === true) {
                return res.status(200).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data
                });
            } else {
                return res.status(404).send({
                    status: serviceSubTypeResponse.status,
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

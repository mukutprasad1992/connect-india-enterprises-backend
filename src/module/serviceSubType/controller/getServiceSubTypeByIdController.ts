import { Controller, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
import { GetServiceSubTypeByIdService } from '../services/GetServiceSubTypeByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { anErrorOccurredWhileRetrievingServiceSubType } from '../common/serviceSubTypeMessage';

@Controller('serviceSubType/getServiceSubTypeById/:id')
export class GetServiceSubTypeByIdController {
    constructor(private readonly getServiceSubTypeByIdService: GetServiceSubTypeByIdService) { }
    @UseGuards(AuthGuard)
    @Get()
    async getProfile(@Param('id') id: number, @Req() req, @Res() res) {
        try {
            const userId = req.user.id;
            const serviceSubTypeResponse = await this.getServiceSubTypeByIdService.getServiceSubTypeById(id);

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

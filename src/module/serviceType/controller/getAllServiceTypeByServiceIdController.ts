import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetServiceTypeByServiceIdService } from '../services/getAllServiceTypeByServiceId';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
} from '../common/serviceTypeMessage';

@Controller('serviceType/getServiceTypeByServiceId/:serviceId')
export class GetServiceTypeByServiceServiceIdController {
    constructor(private readonly getServiceTypeByServiceIdService: GetServiceTypeByServiceIdService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceTypeById(
        @Param('serviceId') serviceId: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceTypeResponse = await this.getServiceTypeByServiceIdService.getServiceTypeByServiceId(serviceId, userId);

            if (serviceTypeResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: serviceTypeResponse.message,
                    data: serviceTypeResponse.data,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: serviceTypeResponse.message,
                    error: serviceTypeResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            });
        }
    }
}

import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountServiceTypeService } from '../services/getAllAmountServiceTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceTypeRetrievalError,
} from '../common/serviceTypeMessage';

@Controller('serviceType/getTotalAmountServiceType/:serviceId')
export class GetTotalAmountServiceTypeController {
    constructor(private readonly getTotalAmountServiceTypeService: GetTotalAmountServiceTypeService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceTypeById(
        @Param('serviceId') serviceId: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceTypeResponse = await this.getTotalAmountServiceTypeService.getTotalAmountServiceType(serviceId);
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

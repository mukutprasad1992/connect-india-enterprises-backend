import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetServiceTypeByIdService } from '../services/getServiceTypeByIdServise';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
} from '../common/serviceTypeMessage';

@Controller('serviceType/getServiceTypeById/:id')
export class GetServiceTypeByIdController {
    constructor(private readonly getServiceTypeByIdService: GetServiceTypeByIdService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceTypeById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const serviceTypeResponse = await this.getServiceTypeByIdService.getServiceTypeById(id);

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

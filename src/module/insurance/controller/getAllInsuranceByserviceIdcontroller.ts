import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetInsuranceByServiceIdService } from '../service/getAllInsuranceByservice';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { insuranceRetrievalError } from '../common/insuranceMessage';


@Controller('insurance/getInsuranceByServiceId/:serviceId')
export class GetAllInsuranceByServiceServiceIdController {
    constructor(private readonly getInsuranceByServiceIdService: GetInsuranceByServiceIdService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getLoanById(
        @Param('serviceId') serviceId: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const insuranceResponse = await this.getInsuranceByServiceIdService.getInsuranceByServiceId(serviceId, userId);

            if (insuranceResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: insuranceResponse.message,
                    data: insuranceResponse.data,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: insuranceResponse.message,
                    error: insuranceResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: insuranceRetrievalError,
                error: error.message,
            });
        }
    }
}

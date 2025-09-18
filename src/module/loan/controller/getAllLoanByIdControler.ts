import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetloanByServiceIdService } from '../services/getAllLoanByIdservice';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { loanRetrievalError } from '../common/loanMessage';


@Controller('loan/getloanByServiceId/:serviceId')
export class GetAllLoanByServiceServiceIdController {
    constructor(private readonly getloanByServiceIdService: GetloanByServiceIdService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getLoanById(
        @Param('serviceId') serviceId: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const loanResponse = await this.getloanByServiceIdService.getLoanByServiceId(serviceId, userId);

            if (loanResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: loanResponse.message,
                    data: loanResponse.data,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: loanResponse.message,
                    error: loanResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: loanRetrievalError,
                error: error.message,
            });
        }
    }
}

import {
    Controller,
    Get,
    Param,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { GetloanByServiceIdService } from '../services/getAllLoanByIdservice';
import {
    errorRetrievingLoansForUserId,
    loanRetrievalError,
    loansRetrievedSuccessfullyForUserId,
    noLoansFoundForUserId,
    retrievingLoansForServiceId
} from '../common/loanMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('loan/getloanByServiceId')
export class GetAllLoanByServiceServiceIdController {
    constructor(
        private readonly getloanByServiceIdService: GetloanByServiceIdService,
        private readonly logger: AppLogger,
    ) { }

    /**
     * @route   GET /loan/getloanByServiceId/:serviceId
     * @desc    Get all loans for a specific service ID and user
     * @access  Protected (AuthGuard)
     */
    @UseGuards(AuthGuard)
    @Get(':serviceId')
    async getLoanById(
        @Param('serviceId') serviceId: number,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.id;
        this.logger.doLog(
            `${retrievingLoansForServiceId} ${serviceId}, userId: ${userId}`,
            'info',
        );

        try {
            const loanResponse = await this.getloanByServiceIdService.getLoanByServiceId(
                serviceId,
                userId,
            );

            if (loanResponse.status === true) {
                this.logger.doLog(
                    `${loansRetrievedSuccessfullyForUserId} ${userId}, serviceId: ${serviceId}`,
                    'success',
                );

                return res.status(200).send({
                    status: true,
                    message: loanResponse.message,
                    data: loanResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${noLoansFoundForUserId} ${userId}, serviceId: ${serviceId}`,
                    'warn',
                );

                return res.status(400).send({
                    status: false,
                    message: loanResponse.message,
                    error: loanResponse.error || null,
                    data: null,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorRetrievingLoansForUserId} ${userId}, serviceId: ${serviceId}: ${error.message}`,
                'error',
            );

            return res.status(500).send({
                status: false,
                message: loanRetrievalError,
                error: error.message,
            });
        }
    }
}

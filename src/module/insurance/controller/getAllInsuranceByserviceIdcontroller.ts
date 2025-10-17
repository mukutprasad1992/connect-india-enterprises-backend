import {
    Controller,
    Get,
    Param,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GetInsuranceByServiceIdService } from '../service/getAllInsuranceByservice';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    insuranceRetrievalError,
    insuranceRetrievedSuccessfully,
    insuranceNotFoundOrValidationFailed,
    insuranceNotFound,
    fetchingInsuranceDetailsForServiceId,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('insurance/getInsuranceByServiceId')
export class GetAllInsuranceByServiceServiceIdController {
    constructor(
        private readonly getInsuranceByServiceIdService: GetInsuranceByServiceIdService,
        private readonly logger: AppLogger,
    ) { }

    /**
     * @route   GET /insurance/getInsuranceByServiceId/:serviceId
     * @desc    Retrieves insurance details for a specific serviceId & user
     * @access  Protected (AuthGuard)
     */
    @UseGuards(AuthGuard)
    @Get(':serviceId')
    async getInsuranceByServiceId(
        @Param('serviceId') serviceId: number,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.id;

        this.logger.doLog(
            `${fetchingInsuranceDetailsForServiceId} ${serviceId}, userId: ${userId}`,
            'info',
        );

        try {
            const insuranceResponse =
                await this.getInsuranceByServiceIdService.getInsuranceByServiceId(
                    serviceId,
                    userId,
                );

            // ✅ Successfully retrieved data
            if (insuranceResponse.status === true) {
                this.logger.doLog(
                    `${insuranceRetrievedSuccessfully} (serviceId: ${serviceId}, userId: ${userId})`,
                    'success',
                );

                return res.status(200).send({
                    status: true,
                    message: insuranceResponse.message,
                    data: insuranceResponse.data,
                });
            }

            // ❌ No insurance found
            this.logger.doLog(
                `${insuranceNotFound} (serviceId: ${serviceId}, userId: ${userId})`,
                'warn',
            );

            return res.status(400).send({
                status: false,
                message: insuranceResponse.message,
                data: null,
            });
        } catch (error) {
            // 🚨 Unexpected Error
            this.logger.doLog(
                `${insuranceRetrievalError} (serviceId: ${serviceId}, userId: ${userId}): ${error.message}`,
                'error',
            );

            return res.status(500).send({
                status: false,
                message: insuranceRetrievalError,
                error: error.message,
            });
        }
    }
}

import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetServiceTypeByServiceIdService } from '../services/getAllServiceTypeByServiceId';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    errorRetrievingServiceTypeForServiceId,
    failedToRetrieveServiceTypeForServiceId,
    forServiceId,
    requestedByUserId,
    requestReceivedGetServiceTypeForServiceId,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getServiceTypeByServiceId/:serviceId')
export class GetServiceTypeByServiceServiceIdController {
    constructor(
        private readonly getServiceTypeByServiceIdService: GetServiceTypeByServiceIdService,
        private readonly logger: AppLogger,
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceTypeById(
        @Param('serviceId') serviceId: number,
        @Res() res,
        @Req() req,
    ) {
        const userId = req.user.id;

        this.logger.doLog(
            `${requestReceivedGetServiceTypeForServiceId} ${serviceId}, ${requestedByUserId} ${userId}`,
            'success',
        );

        try {
            const serviceTypeResponse =
                await this.getServiceTypeByServiceIdService.getServiceTypeByServiceId(
                    serviceId,
                    userId,
                );

            if (serviceTypeResponse.status === true) {
                this.logger.doLog(
                    `${serviceTypeRetrievedSuccessfully} ${forServiceId} ${serviceId}, ${requestedByUserId} ${userId}`,
                    'success',
                );

                return res.status(200).send({
                    status: true,
                    message: serviceTypeResponse.message,
                    data: serviceTypeResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToRetrieveServiceTypeForServiceId} ${serviceId}, ${requestedByUserId} ${userId}. Reason: ${serviceTypeResponse.message}`,
                    'fail',
                );

                return res.status(404).send({
                    status: false,
                    message: serviceTypeResponse.message,
                    error: serviceTypeResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorRetrievingServiceTypeForServiceId} ${serviceId}, ${requestedByUserId} ${userId}. Error: ${error.message}`,
                'fail',
            );

            return res.status(500).send({
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            });
        }
    }
}

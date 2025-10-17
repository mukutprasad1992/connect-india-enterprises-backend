import { Controller, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { anErrorOccurredWhileRetrievingServiceSubType, byUserID, errorFetchingServiceSubTypesForServiceID, fetchedSuccessfullyByUserID, noServiceSubTypesFoundForServiceID, requestedByUserID, requestedServiceSubTypesForServiceID, serviceSubTypesForServiceID } from '../common/serviceSubTypeMessage';
import { GetServiceSubTypeByServiceIdService } from '../services/getAllServiceSubTypeByServiceIdService';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/getServiceSubTypeByServiceId/:serviceId')
export class GetServiceSubTypeByServiceIdController {
    constructor(
        private readonly getServiceSubTypeByServiceIdService: GetServiceSubTypeByServiceIdService,
        private readonly logger: AppLogger
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getProfile(@Param('serviceId') serviceId: number, @Req() req, @Res() res) {
        const userId = req.user.id;
        this.logger.doLog(`User ID: ${userId} ${requestedServiceSubTypesForServiceID} ${serviceId}`, 'info');

        try {
            const serviceSubTypeResponse =
                await this.getServiceSubTypeByServiceIdService.getServiceSubTypeByServiceId(serviceId);

            if (serviceSubTypeResponse.status === true) {
                this.logger.doLog(
                    `${serviceSubTypesForServiceID} ${serviceId} ${fetchedSuccessfullyByUserID} ${userId}`,
                    'success'
                );
                return res.status(200).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data
                });
            } else {
                this.logger.doLog(
                    `${noServiceSubTypesFoundForServiceID} ${serviceId} (${requestedByUserID} ${userId})`,
                    'warn'
                );
                return res.status(404).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    error: serviceSubTypeResponse.error,
                    result: null
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingServiceSubTypesForServiceID} ${serviceId} ${byUserID} ${userId} — ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                error: error.message
            });
        }
    }
}

import { Controller, Res, UseGuards, Req, Get } from '@nestjs/common';
import { GetALLServiceTypeByIdService } from '../services/getAllServiceTypeServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { errorFetchingAllServiceTypesForUserId, failedToFetchServiceTypesForUserId, fetchedAllServiceTypesSuccessfullyForUserId, requestReceivedGetAllServiceTypesForUserId, serviceTypeRetrievalError } from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getAllServiceType')
export class GetAllServiceTypesController {
    constructor(
        private readonly getALLServiceTypeByIdService: GetALLServiceTypeByIdService,
        private readonly logger: AppLogger,
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getUserServiceTypes(@Res() res, @Req() req) {
        const userId = req.user.id;

        this.logger.doLog(
            `${requestReceivedGetAllServiceTypesForUserId} ${userId}`,
            'success',
        );

        try {
            const serviceTypesResponse =
                await this.getALLServiceTypeByIdService.getAllServiceTypesData(userId);

            if (serviceTypesResponse.status === true) {
                this.logger.doLog(
                    `${fetchedAllServiceTypesSuccessfullyForUserId} ${userId}`,
                    'success',
                );

                return res.status(200).send({
                    status: true,
                    message: serviceTypesResponse.message,
                    data: serviceTypesResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToFetchServiceTypesForUserId} ${userId}. Reason: ${serviceTypesResponse.message}`,
                    'fail',
                );

                return res.status(400).send({
                    status: false,
                    message: serviceTypesResponse.message,
                    error: serviceTypesResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorFetchingAllServiceTypesForUserId} ${userId}. Error: ${error.message}`,
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

import {
    Controller,
    Put,
    Param,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { UpdateIsReadByIdService } from '../service/updateIsReadByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { errorMarkingNotificationAsReadNotificationId, failedToMarkNotificationAsReadNotificationId, notificationMarkedAsReadSuccessfullyNotificationId, receivedRequestToMarkNotificationAsReadNotificationId, somethingWentWrong } from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('notification/updateisRead')
@UseGuards(AuthGuard)
export class UpdateIsReadByIdController {
    constructor(
        private readonly updateIsReadByIdService: UpdateIsReadByIdService,
        private readonly logger: AppLogger
    ) { }

    @Put('/:id')
    async updateIsReadById(@Param('id') id: number, @Res() res, @Req() req) {
        this.logger.doLog(`${receivedRequestToMarkNotificationAsReadNotificationId} = ${id}`, 'info');

        try {
            const response = await this.updateIsReadByIdService.updateIsReadById(id);

            if (response.status === true) {
                this.logger.doLog(`${notificationMarkedAsReadSuccessfullyNotificationId} = ${id}`, 'success');
                return res.status(200).send({
                    status: true,
                    message: response.message,
                });
            } else {
                this.logger.doLog(`${failedToMarkNotificationAsReadNotificationId} = ${id}, Reason: ${response.message}`, 'warn');
                return res.status(400).send({
                    status: false,
                    message: response.message,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorMarkingNotificationAsReadNotificationId} = ${id}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: somethingWentWrong,
                error: error.message,
            });
        }
    }
}

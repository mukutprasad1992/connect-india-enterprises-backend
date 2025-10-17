import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { GetAllUserNotificationService } from '../service/getAllUserNotificationService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { errorFetchingNotificationsForUserId, failedToFetchNotificationsForUserId, notificationsForUserId, receivedRequestToFetchNotificationsForUserId, somethingWentWrong } from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('notification/getAllUserNotification')
@UseGuards(AuthGuard)
export class GetAllUserNotificationController {
    constructor(
        private readonly getAllUserNotificationService: GetAllUserNotificationService,
        private readonly logger: AppLogger
    ) { }

    @Get()
    async getAllUserNotifications(@Res() res, @Req() req) {
        const userId = req.user.id;
        this.logger.doLog(`${receivedRequestToFetchNotificationsForUserId} ${userId}`, 'info');

        try {
            const response = await this.getAllUserNotificationService.getAllNotifications(userId);

            if (response.status === true) {
                this.logger.doLog(`Fetched ${response.data?.length || 0} ${notificationsForUserId} ${userId}`, 'success');
                return res.status(200).send({
                    status: true,
                    message: response.message,
                    result: response.data,
                });
            } else {
                this.logger.doLog(`${failedToFetchNotificationsForUserId} ${userId}, Reason: ${response.message}`, 'warn');
                return res.status(400).send({
                    status: false,
                    message: response.message,
                    result: null,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorFetchingNotificationsForUserId} ${userId}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: somethingWentWrong,
                error: error.message,
            });
        }
    }
}

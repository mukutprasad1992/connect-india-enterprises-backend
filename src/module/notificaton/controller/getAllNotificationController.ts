import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllNotificationService } from '../service/getAllNotificationService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
  errorFetchingNotifications,
  failedToFetchNotifications,
  fetchedAllNotificationsSuccessfullyTotal,
  receivedRequestToFetchAllNotifications,
  somethingWentWrong,
} from '../common/notificationMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('notification/getAllNotification')
@UseGuards(AuthGuard)
export class GetAllNotificationController {
  constructor(
    private readonly getAllNotificationService: GetAllNotificationService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  async getAllNotifications(@Res() res, @Req() req) {
    this.logger.doLog(receivedRequestToFetchAllNotifications, 'info');

    try {
      const response =
        await this.getAllNotificationService.getAllNotifications();

      if (response.status === true) {
        this.logger.doLog(
          `${fetchedAllNotificationsSuccessfullyTotal} ${response.data?.length || 0}`,
          'success',
        );
        return res.status(200).send({
          status: true,
          message: response.message,
          result: response.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchNotifications} ${response.message}`,
          'warn',
        );
        return res.status(400).send({
          status: false,
          message: response.message,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingNotifications} ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: somethingWentWrong,
        error: error.message,
      });
    }
  }
}

import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { GetAllNotificationService } from '../service/getAllNotificationService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/getAllNotification')
@UseGuards(AuthGuard)
export class GetAllNotificationController {
    constructor(
        private readonly getAllNotificationService: GetAllNotificationService
    ) { }

    @Get()
    async getAllNotifications(@Res() res, @Req() req) {
        try {
            const response = await this.getAllNotificationService.getAllNotifications();

            if (response.status === true) {
                return res.status(200).send({
                    status: true,
                    message: response.message,
                    result: response.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: response.message,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: somethingWentWrong,
                error: error.message,
            });
        }
    }
}

import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { GetAllUserNotificationService } from '../service/getAllUserNotificationService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/getAllUserNotification')
@UseGuards(AuthGuard)
export class GetAllUserNotificationController {
    constructor(
        private readonly getAllUserNotificationService: GetAllUserNotificationService
    ) { }

    @Get()
    async getAllUserNotifications(@Res() res, @Req() req) {
        try {
            const userId = req.user.id
            const response = await this.getAllUserNotificationService.getAllNotifications(userId);

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

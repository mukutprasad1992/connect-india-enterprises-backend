import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req,
    Param
} from '@nestjs/common';
import { GetAllNotificationByUserIdService } from '../service/getAllNotificationByUserIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/getNotificationsByUserId')
@UseGuards(AuthGuard)
export class GetNotificationsByUserIdController {
    constructor(
        private readonly getAllNotificationByUserIdService: GetAllNotificationByUserIdService
    ) { }

    @Get('/:userId')
    async getAllNotifications(@Param('userId') userId: number, @Res() res, @Req() req) {
        try {
            const response = await this.getAllNotificationByUserIdService.getNotificationsByUserId(userId);

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

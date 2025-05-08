import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { GetAllAdminNotificationService } from '../service/getAllAdminNotificationService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/getAllAdminNotification')
@UseGuards(AuthGuard)
export class GetAllAdminNotificationController {
    constructor(
        private readonly getAllAdminNotificationService: GetAllAdminNotificationService
    ) { }

    @Get()
    async getAllNotificationByAdmin(@Res() res, @Req() req) {
        try {
            const response = await this.getAllAdminNotificationService.getNotificationsByAdmin();

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

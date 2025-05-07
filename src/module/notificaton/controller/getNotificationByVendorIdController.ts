import {
    Controller,
    Get,
    Res,
    UseGuards,
    Req,
    Param
} from '@nestjs/common';
import { GetNotificationsByVendorIdService } from '../service/getNotificationByVendorIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/getNotificationsByVendorId')
@UseGuards(AuthGuard)
export class GetNotificationsByVendorIdController {
    constructor(
        private readonly getNotificationsByVendorIdService: GetNotificationsByVendorIdService
    ) { }

    @Get('/:vendorId')
    async getAllNotifications(@Param('vendorId') vendorId: number, @Res() res, @Req() req) {
        try {
            const response = await this.getNotificationsByVendorIdService.getNotificationsById(vendorId);

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

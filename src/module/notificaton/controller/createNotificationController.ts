import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    UseGuards,
    HttpStatus
} from '@nestjs/common';
import { CreateNotificationService } from '../service/createNotificationService';
import { CreateNotificationDTO } from '../notificationDTO/createNotificationDTO';
import { JoiValidationNotification } from '../common/joiValidationNotification';
// import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('notification/createNotification')
// @UseGuards(AuthGuard)
export class CreateNotificationController {
    constructor(private readonly createNotificationService: CreateNotificationService) { }

    @Post()
    async create(
        @Body(new JoiValidationNotification()) createNotificationDto: CreateNotificationDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            // const userId = req.user.id;
            const response = await this.createNotificationService.createNotification(createNotificationDto);

            if (response.status === true) {
                return res.status(201).send({
                    status: response.status,
                    message: response.message,
                    result: response.data,
                });
            } else {
                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}

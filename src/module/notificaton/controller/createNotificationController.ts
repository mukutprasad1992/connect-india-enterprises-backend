import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    UseGuards,
    HttpStatus
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateNotificationService } from '../service/createNotificationService';
import { CreateNotificationDTO } from '../notificationDTO/createNotificationDTO';
import { JoiValidationNotification } from '../common/joiValidationNotification';
import { AppLogger } from 'src/utils/common/loggerService';
import { createNotificationRequestReceived, errorCreatingNotification, failedToCreateNotificationReason, notificationCreatedSuccessfully } from '../common/notificationMessage';
// import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('notification/createNotification')
// @UseGuards(AuthGuard)
export class CreateNotificationController {
    constructor(
        private readonly createNotificationService: CreateNotificationService,
        private readonly logger: AppLogger
    ) { }

    @Post()
    async create(
        @Body(new JoiValidationNotification()) createNotificationDto: CreateNotificationDTO,
        @Res() res: Response,
        @Req() req: Request
    ) {
        // Custom log: incoming request
        this.logger.doLog(createNotificationRequestReceived, 'info');

        try {
            const response = await this.createNotificationService.createNotification(createNotificationDto);

            if (response.status === true) {
                // Custom log: success
                this.logger.doLog(notificationCreatedSuccessfully, 'success');
                return res.status(201).send({
                    status: response.status,
                    message: response.message,
                    result: response.data,
                });
            } else {
                // Custom log: failure
                this.logger.doLog(`${failedToCreateNotificationReason} ${response.message}`, 'warn');
                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                    result: null,
                });
            }
        } catch (error) {
            // Custom log: error
            this.logger.doLog(`${errorCreatingNotification}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}

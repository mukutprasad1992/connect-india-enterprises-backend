import { Controller, Put, Body, Param, Res, UseGuards, Request, Post } from '@nestjs/common';
import { ChangePasswordService } from '../service/authChangePasswordService';
import { ChangePasswordDTO } from '../authDTO/changePasswordDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import {
    anErrorOccurredWhileLoggingInTheUser,
    errorOccurredWhileChangingPasswordUserId,
    failedToChangePasswordUserId,
    passwordChangedSuccessfullyUserId,
    requestReceivedChangePasswordByUserId
} from '../common/authMessage';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('auth/changePassword')
export class ChangePasswordController {
    constructor(
        private readonly changePasswordService: ChangePasswordService,
        private readonly logger: AppLogger,
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    async changePassword(
        @Body(new JoiValidationAuth(ChangePasswordDTO.changePasswordSchema)) changePasswordDTO: ChangePasswordDTO,
        @Request() req,
        @Res() res
    ): Promise<any> {
        const userId = req.user.id;
        this.logger.doLog(`${requestReceivedChangePasswordByUserId} ${userId}`, 'success');

        try {
            const response = await this.changePasswordService.changePassword(userId, changePasswordDTO);

            if (!response.status) {
                this.logger.doLog(
                    `${failedToChangePasswordUserId} ${userId}, Reason: ${response.message}`,
                    'fail',
                );

                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                    data: response.data,
                });
            }

            this.logger.doLog(`${passwordChangedSuccessfullyUserId} ${userId}`, 'success');

            return res.status(200).send({
                status: response.status,
                message: response.message,
                data: response.data,
            });

        } catch (error) {
            this.logger.doLog(
                `${errorOccurredWhileChangingPasswordUserId} ${userId}, Error: ${error.message}`,
                'fail',
            );

            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileLoggingInTheUser,
                error: error.message,
            });
        }
    }
}

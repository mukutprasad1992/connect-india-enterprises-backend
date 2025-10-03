import { Controller, Post, Body, Res } from '@nestjs/common';
import { ForgetPasswordService } from '../service/authForgetPasswordService';
import {
    anErrorOccurredWhileSendingResetEmail,
    errorOccurredWhileSendingResetEmailEmail,
    failedToSendResetEmailEmail,
    requestReceivedForgotPasswordForEmail,
    resetEmailSentSuccessfullyEmail
} from '../common/authMessage';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import { ForgetPasswordDTO } from '../authDTO/forgetPasswordDTO';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('auth/forgotPassword')
export class ForgetPasswordController {
    constructor(
        private readonly forgetPasswordService: ForgetPasswordService,
        private readonly logger: AppLogger,
    ) { }

    @Post()
    async forgotPassword(
        @Body(new JoiValidationAuth(ForgetPasswordDTO.forgetPasswordSchema)) forgetPasswordDTO: ForgetPasswordDTO,
        @Res() res
    ) {
        this.logger.doLog(`${requestReceivedForgotPasswordForEmail} ${forgetPasswordDTO.email}`, 'success');

        try {
            const response = await this.forgetPasswordService.handleForgotPassword(forgetPasswordDTO.email);

            if (response.status === true) {
                this.logger.doLog(`${resetEmailSentSuccessfullyEmail} ${forgetPasswordDTO.email}`, 'success');

                return res.status(200).send({
                    status: response.status,
                    message: response.message,
                });
            } else {
                this.logger.doLog(`${failedToSendResetEmailEmail} ${forgetPasswordDTO.email}, Reason: ${response.message}`, 'fail');

                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorOccurredWhileSendingResetEmailEmail} ${forgetPasswordDTO.email}, Error: ${error.message}`, 'fail');

            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileSendingResetEmail,
                error: error.message,
            });
        }
    }
}

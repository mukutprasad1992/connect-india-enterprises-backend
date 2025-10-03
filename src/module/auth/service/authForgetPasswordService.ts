import { Injectable } from '@nestjs/common';
import { MailService } from '../../../utils/mailer/authMailer';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    anErrorOccurredWhileSendingResetEmail,
    emailCheckExistsEmail,
    emailCheckNotFoundEmail,
    emailExistsEmail,
    emailIdExist,
    emailNotFound,
    emailNotFoundEmail,
    errorDuringPasswordResetEmail,
    errorSavingResetTokenUserId,
    failedToSaverResetTokenUserId,
    failedToSendPasswordResetEmailEmail,
    failedToSendResetEmail,
    passwordResetEmailSentSuccessfullyEmail,
    passwordResetRequestReceivedEmail,
    resetTokenGeneratedUserId,
    resetTokenNotSaved,
    resetTokenSavedSuccessfullyUserId,
    resetTokenSavedUserId,
} from '../common/authMessage';

@Injectable()
export class ForgetPasswordService {
    constructor(
        private readonly MailService: MailService,
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async handleForgotPassword(email: string): Promise<any> {
        this.logger.doLog(`${passwordResetRequestReceivedEmail} ${email}`, 'success');

        try {
            const user = await this.isEmailExist(email);

            if (!user.status) {
                this.logger.doLog(`${emailNotFoundEmail} ${email}`, 'fail');
                return {
                    status: false,
                    message: emailNotFound,
                    data: null,
                };
            }

            this.logger.doLog(`${emailExistsEmail} ${email}`, 'success');

            const resetToken = jwt.sign({ id: user.data.id }, process.env.JWT_SECRET || 'default_secret', {
                expiresIn: '1h',
            });
            this.logger.doLog(`${resetTokenGeneratedUserId} ${user.data.id}`, 'success');

            const saveToken = await this.saveResetToken(user.data.id, resetToken);

            if (!saveToken) {
                this.logger.doLog(`${failedToSaverResetTokenUserId} ${user.data.id}`, 'fail');
                return {
                    status: false,
                    message: resetTokenNotSaved,
                };
            }

            this.logger.doLog(`${resetTokenSavedSuccessfullyUserId} ${user.data.id}`, 'success');

            const mail = await this.MailService.sendPasswordResetEmail(email, resetToken);

            if (mail.status === true) {
                this.logger.doLog(`${passwordResetEmailSentSuccessfullyEmail} ${email}`, 'success');
                return {
                    status: true,
                    message: mail.message,
                    data: resetToken,
                };
            }

            this.logger.doLog(`${failedToSendPasswordResetEmailEmail} ${email}`, 'fail');
            return {
                status: false,
                message: mail.message || failedToSendResetEmail,
            };
        } catch (error) {
            this.logger.doLog(`${errorDuringPasswordResetEmail} ${email}. Error: ${error.message}`, 'fail');
            return {
                status: false,
                message: anErrorOccurredWhileSendingResetEmail,
                error: error.message,
            };
        }
    }

    private async isEmailExist(email: string): Promise<any> {
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1;';
        const result = await this.dataSource.query(query, [email]);

        if (result.length === 0) {
            this.logger.doLog(`${emailCheckNotFoundEmail} ${email}`, 'fail');
            return {
                status: false,
                message: emailNotFound,
                data: null,
            };
        }

        this.logger.doLog(`${emailCheckExistsEmail} ${email}`, 'success');
        return {
            status: true,
            message: emailIdExist,
            data: result[0],
        };
    }

    private async saveResetToken(id: string, resetToken: string): Promise<any> {
        try {
            const query = 'UPDATE users SET resetToken = ? WHERE id = ?';
            const result = await this.dataSource.query(query, [resetToken, id]);

            this.logger.doLog(`${resetTokenSavedUserId} ${id}`, 'success');
            return result.affectedRows > 0 || result.changedRows > 0 || true;
        } catch (error) {
            this.logger.doLog(`${errorSavingResetTokenUserId} ${id}. Error: ${error.message}`, 'fail');
            return {
                status: false,
                error: error.message,
            };
        }
    }
}

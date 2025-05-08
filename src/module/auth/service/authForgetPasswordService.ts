import { Injectable } from '@nestjs/common';
import { MailService } from '../../../utils/mailer/authMailer';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import {
    anErrorOccurredWhileSendingResetEmail,
    emailIdExist,
    emailNotFound,
    failedToSendResetEmail,
    resetTokenNotSaved,
} from '../common/authMessage';

@Injectable()
export class ForgetPasswordService {
    constructor(
        private readonly MailService: MailService,
        private readonly dataSource: DataSource,
    ) { }

    async handleForgotPassword(email: string): Promise<any> {
        try {
            const user = await this.isEmailExist(email);
            if (!user.status) {
                return {
                    status: false,
                    message: emailNotFound,
                    data: null,
                };
            }

            const resetToken = jwt.sign({ id: user.data.id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            const saveToken = await this.saveResetToken(user.data.id, resetToken);
            if (!saveToken) {
                return {
                    status: false,
                    message: resetTokenNotSaved,
                };
            }

            const mail = await this.MailService.sendPasswordResetEmail(email, resetToken);
            if (mail.status === true) {
                return {
                    status: true,
                    message: mail.message,
                    data: resetToken,
                };
            }

            return {
                status: false,
                message: mail.message || failedToSendResetEmail,
            };

        } catch (error) {
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
            return {
                status: false,
                message: emailNotFound,
                data: null,
            };
        }

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
            return result.affectedRows > 0 || result.changedRows > 0 || true;
        } catch (error) {

            return {
                status: false,
                error: error.messages
            };
        }
    }
}

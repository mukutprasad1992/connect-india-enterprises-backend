import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import {
    userIdNotFound,
    passwordResetSuccessfully,
    anErrorOccurredWhileCheckingTheUser,
    noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
    anErrorOccurredWhileUpdatingThePassword,
    invalidOrExpiredResetToken,
    yourLinkHasExpiredPleaseRegenerateTheLinkToProceed
} from '../common/authMessage';

@Injectable()
export class ResetPasswordService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }
    async resetPassword(resetToken: string, newPassword: string): Promise<any> {
        let decodedToken;
        try {
            decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (error) {
            return {
                status: false,
                message: invalidOrExpiredResetToken,
                error: error.message,
            };
        }
        const id = decodedToken.id;
        const user = await this.isUserExist(id);
        if (!user) {
            return {
                status: false,
                message: userIdNotFound,
            };
        }
        const isResetPassword = await this.isResetPasswordExist(resetToken);
        if (!isResetPassword) {
            return {
                status: false,
                message: yourLinkHasExpiredPleaseRegenerateTheLinkToProceed,
            };
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        try {
            await this.updateUserPassword(id, hashedPassword);
            await this.clearResetToken(id);
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingThePassword,
                error: error.message,
            };
        }
        return {
            status: true,
            message: passwordResetSuccessfully,
        };
    }
    private async isUserExist(id: string): Promise<any> {
        try {
            const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
            const result = await this.dataSource.query(query, [id]);

            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileCheckingTheUser,
                error: error.message,
            };
        }
    }
    private async isResetPasswordExist(resetToken: string): Promise<any> {
        try {
            const query = 'SELECT * FROM users WHERE resetToken = ? LIMIT 1';
            const result = await this.dataSource.query(query, [resetToken]);

            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileCheckingTheUser,
                error: error.message,
            };
        }
    }
    private async updateUserPassword(id: string, hashedPassword: string): Promise<any> {
        try {
            const query = 'UPDATE users SET password = ? WHERE id = ?';
            const result = await this.dataSource.query(query, [hashedPassword, id]);
            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingThePassword,
                error: error.message,
            };
        }
    }
    private async clearResetToken(id: string): Promise<any> {
        try {
            const query = 'UPDATE users SET resetToken = NULL WHERE id = ?';
            const clear = await this.dataSource.query(query, [id]);
            if (clear.affectedRows === 0) {
                return {
                    status: false,
                    message: noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingThePassword,
                error: error.message,
            };
        }
    }
}

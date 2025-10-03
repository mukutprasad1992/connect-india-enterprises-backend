import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    userIdNotFound,
    passwordResetSuccessfully,
    anErrorOccurredWhileCheckingTheUser,
    noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
    anErrorOccurredWhileUpdatingThePassword,
    invalidOrExpiredResetToken,
    yourLinkHasExpiredPleaseRegenerateTheLinkToProceed,
    resetPasswordRequestReceivedResetToken,
    resetTokenVerifiedUserId,
    invalidOrExpiredResetTokenError,
    userNotFoundUserId,
    resetTokenExpiredOrNotFoundUserId,
    passwordResetSuccessfullyUserId,
    errorupdatingPasswordUserId,
    userExistenceCheckNotFoundUserId,
    userExistenceCheckFoundUserId,
    errorCheckingUserExistenceUserId,
    resetTokenExistenceCheckNotFoundToken,
    resetTokenExistenceCheckFoundUserId,
    errorCheckingResetTokenError,
    noUserUpdatedOrNoChangesMadeUserId,
    passwordUpdatedUserId,
    errorUpdatingPasswordUserId,
    failedToClearResetTokenUserId,
    resetTokenClearedUserId,
    errorClearingResetTokenUserId
} from '../common/authMessage';

@Injectable()
export class ResetPasswordService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async resetPassword(resetToken: string, newPassword: string): Promise<any> {
        this.logger.doLog(`${resetPasswordRequestReceivedResetToken} ${resetToken}`, 'success');

        let decodedToken;
        try {
            decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET || 'default_secret');
            this.logger.doLog(`${resetTokenVerifiedUserId} ${decodedToken.id}`, 'success');
        } catch (error) {
            this.logger.doLog(`${invalidOrExpiredResetTokenError} ${error.message}`, 'fail');
            return {
                status: false,
                message: invalidOrExpiredResetToken,
                error: error.message,
            };
        }

        const id = decodedToken.id;
        const user = await this.isUserExist(id);
        if (!user) {
            this.logger.doLog(`${userNotFoundUserId} ${id}`, 'fail');
            return {
                status: false,
                message: userIdNotFound,
            };
        }

        const isResetPassword = await this.isResetPasswordExist(resetToken);
        if (!isResetPassword) {
            this.logger.doLog(`${resetTokenExpiredOrNotFoundUserId} ${id}`, 'fail');
            return {
                status: false,
                message: yourLinkHasExpiredPleaseRegenerateTheLinkToProceed,
            };
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        try {
            await this.updateUserPassword(id, hashedPassword);
            await this.clearResetToken(id);
            this.logger.doLog(`${passwordResetSuccessfullyUserId} ${id}`, 'success');
        } catch (error) {
            this.logger.doLog(`${errorupdatingPasswordUserId} ${id}. Error: ${error.message}`, 'fail');
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
                this.logger.doLog(`${userExistenceCheckNotFoundUserId} ${id}`, 'fail');
                return null;
            }

            this.logger.doLog(`${userExistenceCheckFoundUserId} ${id}`, 'success');
            return result[0];
        } catch (error) {
            this.logger.doLog(`${errorCheckingUserExistenceUserId} ${id}. Error: ${error.message}`, 'fail');
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
                this.logger.doLog(`${resetTokenExistenceCheckNotFoundToken} ${resetToken}`, 'fail');
                return null;
            }

            this.logger.doLog(`${resetTokenExistenceCheckFoundUserId} ${result[0].id}`, 'success');
            return result[0];
        } catch (error) {
            this.logger.doLog(`${errorCheckingResetTokenError} ${error.message}`, 'fail');
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
                this.logger.doLog(`${noUserUpdatedOrNoChangesMadeUserId} ${id}`, 'fail');
                return {
                    status: false,
                    message: noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
                };
            }

            this.logger.doLog(`${passwordUpdatedUserId} ${id}`, 'success');
        } catch (error) {
            this.logger.doLog(`${errorUpdatingPasswordUserId} ${id}. Error: ${error.message}`, 'fail');
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
                this.logger.doLog(`${failedToClearResetTokenUserId} ${id}`, 'fail');
                return {
                    status: false,
                    message: noUserFoundWithTheProvidedIDOrNoChangesHaveBeenMade,
                };
            }

            this.logger.doLog(`${resetTokenClearedUserId} ${id}`, 'success');
        } catch (error) {
            this.logger.doLog(`${errorClearingResetTokenUserId} ${id}. Error: ${error.message}`, 'fail');
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingThePassword,
                error: error.message,
            };
        }
    }
}

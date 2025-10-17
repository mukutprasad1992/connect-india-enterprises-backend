import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { VendorBlockOrUnblockMailService } from '../../../utils/mailer/vendorBlockOrUnblockMail';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    errorOccurredWhileUpdatingStatusForUserId,
    failedToSendMailForUserId,
    invalidStatusValueProvided,
    invalidStatusValueProvidedForUserId,
    noChangesMadeWhileUpdatingStatusForUserId,
    startingStatusUpdateForUserId,
    userIdNotFound,
    userNotFoundForId,
    userNotFoundOrNoChangesHaveBeenMade,
    userStatusUpdatedSuccessfully,
    userStatusUpdatedSuccessfullyForId,
    userUpdateError,
} from '../common/userMessage';

@Injectable()
export class UpdateUserStatusService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly vendorBlockOrUnblockMailService: VendorBlockOrUnblockMailService,
        private readonly logger: AppLogger
    ) { }

    async getUserById(id: number): Promise<UserSchema | null | any> {
        const user = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return user.length > 0 ? user[0] : null;
    }

    async updateUserStatus(
        id: number,
        updateData: UpdateUserDTO,
        userId: number
    ): Promise<any> {
        this.logger.doLog(`${startingStatusUpdateForUserId} ${id}`, 'info');

        try {
            const { status } = updateData;

            if (status !== 'Enable' && status !== 'Disable') {
                this.logger.doLog(`${invalidStatusValueProvidedForUserId} ${id}`, 'warn');
                return {
                    status: false,
                    message: invalidStatusValueProvided,
                    data: null,
                };
            }

            const userExists = await this.getUserById(id);
            if (!userExists) {
                this.logger.doLog(`${userNotFoundForId} ${id}`, 'warn');
                return {
                    status: false,
                    message: userIdNotFound,
                    data: null,
                };
            }

            const query = `UPDATE users SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE id = ?`;
            const updateResult = await this.dataSource.query(query, [
                status,
                userId,
                id,
            ]);

            if (updateResult.affectedRows === 0) {
                this.logger.doLog(`${noChangesMadeWhileUpdatingStatusForUserId} ${id}`, 'warn');
                return {
                    status: false,
                    message: userNotFoundOrNoChangesHaveBeenMade,
                    data: null,
                };
            }

            const updatedUser = await this.getUserById(id);
            this.logger.doLog(`${userStatusUpdatedSuccessfullyForId} ${id} to ${status}`, 'success');

            const mail = await this.vendorBlockOrUnblockMailService.emailVendorBlockOrUnblock(updatedUser.email, status, updatedUser.businessName);
            if (!mail) {
                this.logger.doLog(`${failedToSendMailForUserId} ${id}`, 'warn');
                return {
                    status: false,
                    message: "Fail mail",
                };
            }

            return {
                status: true,
                message: userStatusUpdatedSuccessfully,
                data: updatedUser,
            };
        } catch (error) {
            this.logger.doLog(`${errorOccurredWhileUpdatingStatusForUserId} ${id}, error: ${error.message}`, 'error');
            return {
                status: false,
                message: userUpdateError,
                error: error.message,
            };
        }
    }
}

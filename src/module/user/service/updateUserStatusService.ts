import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { VendorBlockOrUnblockMailService } from '../../../utils/mailer/vendorBlockOrUnblockMail'
import {
    invalidStatusValueProvided,
    userIdNotFound,
    userNotFoundOrNoChangesHaveBeenMade,
    userStatusUpdatedSuccessfully,
    userUpdateError,
} from '../common/userMessage';

@Injectable()
export class UpdateUserStatusService {
    constructor(private readonly dataSource: DataSource,
        private readonly vendorBlockOrUnblockMailService: VendorBlockOrUnblockMailService
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
        try {
            const { status } = updateData;


            if (status !== 'Enable' && status !== 'Disable') {
                return {
                    status: false,
                    message: invalidStatusValueProvided,
                    data: null,
                };
            }

            const userExists = await this.getUserById(id);
            if (!userExists) {
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
                return {
                    status: false,
                    message: userNotFoundOrNoChangesHaveBeenMade,
                    data: null,
                };
            }

            const updatedUser = await this.getUserById(id);
            const mail = await this.vendorBlockOrUnblockMailService.emailVendorBlockOrUnblock(updatedUser.email, status, updatedUser.businessName);
            if (!mail) {
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
            return {
                status: false,
                message: userUpdateError,
                error: error.message,
            };
        }
    }
}

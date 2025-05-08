import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import {
    invalidStatusValueProvided,
    userIdNotFound,
    userNotFoundOrNoChangesHaveBeenMade,
    userStatusUpdatedSuccessfully,
    userUpdateError,
} from '../common/userMessage';

@Injectable()
export class UpdateUserStatusService {
    constructor(private readonly dataSource: DataSource) { }

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

            // ✅ Check if user exists
            const userExists = await this.getUserById(id);
            if (!userExists) {
                return {
                    status: false,
                    message: userIdNotFound,
                    data: null,
                };
            }

            // ✅ Update query
            const query = `UPDATE users SET status = ?, updatedAt = NOW(), updatedBy = ? WHERE id = ?`;
            const updateResult = await this.dataSource.query(query, [
                status,
                userId,
                id,
            ]);

            // ✅ Handle no update case
            if (updateResult.affectedRows === 0) {
                return {
                    status: false,
                    message: userNotFoundOrNoChangesHaveBeenMade,
                    data: null,
                };
            }

            // ✅ Fetch updated user
            const updatedUser = await this.getUserById(id);

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

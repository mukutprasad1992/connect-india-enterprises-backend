import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateUserDto } from '../profileDTO/updateProfileDTO';
import {
    profileUpdateSuccessfully,
    profileRetrievalSuccessfully,
    profileNotFound,
    anErrorOccurredWhileUpdatingProfile,
    profileUpdateFailedNoRowsWereAffected,
    profileUpdateFailed,
} from '../common/profileMessage';

@Injectable()
export class UpdateProfileService {
    constructor(private readonly dataSource: DataSource) { }

    async getUserById(userId: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );
            if (result.length > 0) {
                return {
                    status: true,
                    message: profileRetrievalSuccessfully,
                    data: result[0],
                };
            } else {
                return {
                    status: false,
                    message: profileNotFound,
                    data: null,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingProfile,
                error: error.message,
            };
        }
    }

    async updateProfile(userId: number, dto: UpdateUserDto): Promise<any> {
        try {
            const existing = await this.getUserById(userId);
            if (!existing.status || !existing.data) {
                return {
                    status: false,
                    message: profileNotFound,
                    data: null,
                };
            }

            const fields = [];
            const values = [];
            for (const [key, value] of Object.entries(dto)) {
                if (value !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            }
            fields.push('updatedAt = ?');
            values.push(new Date());
            values.push(userId);

            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            const result = await this.dataSource.query(query, values);

            if (!result.affectedRows || result.affectedRows === 0) {
                return {
                    status: false,
                    message: profileUpdateFailedNoRowsWereAffected,
                    data: null,
                };
            }

            const updated = await this.getUserById(userId);
            if (updated.status === false) {
                return {
                    status: false,
                    message: profileUpdateFailed,
                    data: null
                }
            }
            else {
                return {
                    status: true,
                    message: profileUpdateSuccessfully,
                    data: updated.data,
                }
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingProfile,
                error: error.message,
            };
        }
    }
}

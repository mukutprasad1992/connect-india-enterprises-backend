import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    profileDeleteSuccessfully,
    profileNotFound,
    profileRetrievalSuccessfully,
    anErrorOccurredWhileDeletingProfile
} from '../common/profileMessage';
@Injectable()
export class DeleteProfileService {
    constructor(private readonly dataSource: DataSource) { }
    async getProfileByUserId(userId: number): Promise<any> {
        try {
            const profile = await this.dataSource.query(
                'SELECT * FROM profiles WHERE userId = ?',
                [userId]
            );

            if (profile.length > 0) {
                return {
                    status: true,
                    message: profileRetrievalSuccessfully,
                    data: profile[0]
                };
            } else {
                return {
                    status: false,
                    message: profileNotFound,
                    data: null
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileDeletingProfile,
                error: error.message
            };
        }
    }
    async deleteProfile(userId: number): Promise<any> {
        try {
            const profile = await this.getProfileByUserId(userId);
            if (!profile || !profile.data) {
                return {
                    status: false,
                    message: profileNotFound,
                    data: null
                };
            }
            const query = 'DELETE FROM profiles WHERE userId = ?';
            await this.dataSource.query(query, [userId]);

            return {
                status: true,
                message: profileDeleteSuccessfully,
                data: null
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileDeletingProfile,
                error: error.message
            };
        }
    }
}

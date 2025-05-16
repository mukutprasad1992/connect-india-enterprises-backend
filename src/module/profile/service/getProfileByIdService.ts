import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { profileRetrievalSuccessfully, profileNotFound, anErrorOccurredWhileRetrievingProfile } from '../common/profileMessage';
@Injectable()
export class GetProfileByIdService {
    constructor(private readonly dataSource: DataSource) { }
    async getProfileByUserId(userId: number): Promise<any> {
        try {
            const profile = await this.dataSource.query(
                'SELECT * FROM users WHERE id = ?',
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
                message: anErrorOccurredWhileRetrievingProfile,
                error: error.message
            };
        }
    }
}

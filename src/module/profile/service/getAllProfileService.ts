import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { profileRetrievalSuccessfully, anErrorOccurredWhileRetrievingProfiles } from '../common/profileMessage';
@Injectable()
export class GetAllProfileService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllProfiles(): Promise<any> {
        try {
            const profiles = await this.dataSource.query('SELECT * FROM profiles');
            return {
                status: true,
                message: profileRetrievalSuccessfully,
                data: profiles
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileRetrievingProfiles,
                error: error.message
            };
        }
    }
}

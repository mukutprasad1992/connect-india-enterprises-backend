import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateProfileDto } from '../profileDTO/createProfileDTO';
import { ProfileSchema } from '../profileEntity/profileSchema';
import { UserSchema } from '../../user/userEntity/userSchema';
import { userNotFound, profileCreateSuccessfully, anErrorOccurredWhileUpdatingTheProfile } from '../common/profileMessage';

@Injectable()
export class CreateProfileService {
    constructor(private readonly dataSource: DataSource) { }
    async getProfileByUserId(userId: number): Promise<ProfileSchema | null> {
        const profile = await this.dataSource.query(
            'SELECT * FROM profiles WHERE userId = ?',
            [userId]
        );
        return profile.length > 0 ? profile[0] : null;
    }
    async getUserByUserId(id: number): Promise<UserSchema | null> {
        const user = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return user.length > 0 ? user[0] : null;
    }
    async createProfile(userId: number, createProfileDto: CreateProfileDto): Promise<any> {
        const { firstName, createdBy, lastName, dateOfBirth, mobileNo, ...addressDetails } = createProfileDto;
        const user = await this.getUserByUserId(userId);
        if (!user) {
            return {
                status: false,
                message: userNotFound
            };
        }
        const createdAt = new Date()
        const query = `INSERT INTO profiles (userId,createdBy, email, userRole, firstName, lastName, dateOfBirth, mobileNo, currentStreet, currentArea, currentCity, currentState, currentCountry, currentPinCode, permanentStreet, permanentArea, permanentCity, permanentState, permanentCountry, permanentPinCode, createdAt)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            userId,
            createdBy,
            user.email,
            user.roleId,
            firstName,
            lastName,
            dateOfBirth,
            user.mobileNo || mobileNo,
            addressDetails.currentStreet,
            addressDetails.currentArea,
            addressDetails.currentCity,
            addressDetails.currentState,
            addressDetails.currentCountry,
            addressDetails.currentPinCode,
            addressDetails.permanentStreet,
            addressDetails.permanentArea,
            addressDetails.permanentCity,
            addressDetails.permanentState,
            addressDetails.permanentCountry,
            addressDetails.permanentPinCode,
            createdAt
        ];

        try {
            const result = await this.dataSource.query(query, values);
            const createdProfile = await this.getProfileByUserId(userId);

            return {
                status: true,
                message: profileCreateSuccessfully,
                data: createdProfile
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingTheProfile,
                error: error.message
            };
        }
    }
}

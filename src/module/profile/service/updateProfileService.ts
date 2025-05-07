import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateProfileDto } from '../profileDTO/updateProfileDTO';
import {
    profileUpdateSuccessfully,
    profileRetrievalSuccessfully,
    profileNotFound,
    anErrorOccurredWhileUpdatingProfile,
    profileUpdateFailedNoRowsWereAffected,
} from '../common/profileMessage';

@Injectable()
export class UpdateProfileService {
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
                message: anErrorOccurredWhileUpdatingProfile,
                error: error.message
            };
        }
    }

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
        try {
            const existingProfile = await this.getProfileByUserId(userId);

            if (!existingProfile.status || !existingProfile.data) {
                return {
                    status: false,
                    message: profileNotFound,
                    data: null
                };
            }
            const {
                firstName,
                lastName,
                dateOfBirth,
                mobileNo,
                updatedBy,
                currentStreet,
                currentArea,
                currentCity,
                currentState,
                currentCountry,
                currentPinCode,
                permanentStreet,
                permanentArea,
                permanentCity,
                permanentState,
                permanentCountry,
                permanentPinCode
            } = updateProfileDto;
            const updatedAt = new Date()

            const query = `UPDATE profiles 
                SET firstName = ?, lastName = ?, dateOfBirth = ?, mobileNo = ?, updatedBy = ?, 
                    currentStreet = ?, currentArea = ?, currentCity = ?, currentState = ?, currentCountry = ?, currentPinCode = ?, 
                    permanentStreet = ?, permanentArea = ?, permanentCity = ?, permanentState = ?, permanentCountry = ?, 
                    permanentPinCode = ?, updatedAt = ?
                WHERE userId = ?`;

            const values = [
                firstName, lastName, dateOfBirth, mobileNo, updatedBy,
                currentStreet, currentArea, currentCity, currentState, currentCountry, currentPinCode,
                permanentStreet, permanentArea, permanentCity, permanentState, permanentCountry, permanentPinCode,
                updatedAt,
                userId
            ];

            const result = await this.dataSource.query(query, values);

            if (!result.affectedRows || result.affectedRows === 0) {
                return {
                    status: false,
                    message: profileUpdateFailedNoRowsWereAffected,
                    data: null
                };
            }

            const updatedProfile = await this.getProfileByUserId(userId);
            return {
                status: true,
                message: profileUpdateSuccessfully,
                data: updatedProfile.data
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingProfile,
                error: error.message
            };
        }
    }
}

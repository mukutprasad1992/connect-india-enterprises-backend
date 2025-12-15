import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../profileDTO/createProfileDTO';
import {
    userNotFound,
    profileCreateSuccessfully,
    anErrorOccurredWhileUpdatingTheProfile,
    profileNotFound,
} from '../common/profileMessage';

@Injectable()
export class CreateProfileService {
    constructor(private readonly dataSource: DataSource) { }

    async getUserByUserId(userId: number): Promise<any | null> {
        const result = await this.dataSource.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
        );
        return result.length ? result[0] : null;
    }

    async createProfile(userId: number, dto: CreateUserDto): Promise<any> {
        const user = await this.getUserByUserId(userId);
        if (!user) {
            return {
                status: false,
                message: userNotFound,
            };
        }

        const {
            firstName,
            lastName,
            mobileNo,
            createdBy,
            address,
            pinCode,
            profileImageURL,
        } = dto;

        const updatedAt = new Date();

        const query = `UPDATE users SET firstName = ?, lastName = ?, mobileNo = ?, createdBy = ?, address = ?, pinCode = ?, profileImageURL = ?, updatedAt = ? WHERE id = ?`;

        const values = [
            firstName,
            lastName,
            mobileNo,
            createdBy || null,
            address || null,
            pinCode || null,
            profileImageURL || null,
            updatedAt,
            userId,
        ];

        const getUpdatedResponse = await this.dataSource.query(query, values);

        try {
            const getUpdatedResponse = await this.dataSource.query(query, values);
            console.log('Update Response:', getUpdatedResponse);
            const updatedUser = await this.getUserByUserId(userId);
            if (!updatedUser) {
                return {
                    status: false,
                    message: profileNotFound
                }
            }
            return {
                status: true,
                message: profileCreateSuccessfully,
                data: updatedUser,
            };
        } catch (error) {
            console.log('Error while updating profile:', error);
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingTheProfile,
                error: error.message,
            };
        }
    }
}

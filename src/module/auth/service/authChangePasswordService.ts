import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDTO } from '../authDTO/changePasswordDTO';
import { UserSchema } from '../../user/userEntity/userSchema';
import {
    inCurrectOldPassword,
    passwordChangedSuccessfully,
    anErrorOccurredWhileChangingYourPassword
} from '../common/authMessage';

@Injectable()
export class ChangePasswordService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }
    async validateUser(userId: string, oldPassword: string): Promise<UserSchema | null> {
        const query = 'SELECT * FROM users r WHERE r.id = ? LIMIT 1';
        const result = await this.dataSource.query(query, [userId]);
        if (result.length === 0) {
            return null;
        }
        const user = result[0];
        if (bcrypt.compareSync(oldPassword, user.password)) {
            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
                mobileNo: user.mobileNo,
                roleId: user.userRole,
                status: user.status,
                createdBy: user.createdBy,
                updatedBy: user.updatedBy
            };
        }
        return null;
    }
    async changePassword(id: string, changePasswordDTO: ChangePasswordDTO): Promise<any> {
        try {
            const user = await this.validateUser(id, changePasswordDTO.oldPassword);
            if (!user) {
                return {
                    status: false,
                    message: inCurrectOldPassword,
                    data: null
                };
            }
            const hashedNewPassword = bcrypt.hashSync(changePasswordDTO.newPassword, 10);
            const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
            const responce = await this.dataSource.query(updateQuery, [hashedNewPassword, id]);
            if (!responce) {
                return {
                    status: false,
                    message: anErrorOccurredWhileChangingYourPassword
                }
            } else {
                return {
                    status: true,
                    message: passwordChangedSuccessfully,
                    data: user,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileChangingYourPassword,
                error: error.message
            };
        }
    }
}

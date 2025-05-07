import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDTO } from '../authDTO/loginAuthDTO';
import { UserSchema } from '../../user/userEntity/userSchema';
import {
    userLoginWasSuccessfulWelcomeBack,
    anErrorOccurredDuringTheAccessTokenUpdate,
    anErrorOccurredDuringLoginPleaseTryAgain,
    invalidEmailOrPassword,
    yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount
} from '../common/authMessage';

@Injectable()
export class LoginService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async validateUser(email: string, password: string): Promise<UserSchema | null | any> {
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        const result = await this.dataSource.query(query, [email]);
        if (result.length === 0) {
            return null;
        }
        const user = result[0];
        if (bcrypt.compareSync(password, user.password)) {
            return {
                id: user.id,
                email: user.email,
                password: user.password,
                mobileNo: user.mobileNo,
                roleId: user.roleId,
                status: user.status,
                accessToken: user.accessToken,
                createdBy: user.createdBy,
                updatedBy: user.updatedBy
            };
        }

        return null;
    }

    async statusUser(email: string): Promise<UserSchema | null | any> {
        const query = 'SELECT * FROM users WHERE email = ? AND status = "Enable" LIMIT 1';
        const result = await this.dataSource.query(query, [email]);

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    async login(loginDTO: LoginDTO): Promise<any> {
        const user = await this.validateUser(loginDTO.email, loginDTO.password);
        if (!user) {
            return {
                status: false,
                message: invalidEmailOrPassword,
            };
        }
        const userStatus = await this.statusUser(loginDTO.email);
        if (!userStatus) {
            return {
                status: false,
                message: yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount,
            };
        }
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        try {
            const updateQuery = 'UPDATE users SET accessToken = ? WHERE id = ?';
            const result = await this.dataSource.query(updateQuery, [accessToken, user.id]);

            if (result.affectedRows === 0) {
                return {
                    status: false,
                    message: anErrorOccurredDuringTheAccessTokenUpdate,
                };
            }
            const { password, ...userWithoutPassword } = user;
            return {
                status: true,
                message: userLoginWasSuccessfulWelcomeBack,
                data: {
                    ...userWithoutPassword,
                    accessToken,
                },
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredDuringLoginPleaseTryAgain,
                error: error.message,
            };
        }
    }
}

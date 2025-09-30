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
    constructor(private readonly dataSource: DataSource) { }

    async validateUser(email: string, password: string): Promise<{ status: boolean; message?: string; user?: UserSchema }> {
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        const result = await this.dataSource.query(query, [email]);

        if (result.length === 0) {
            return { status: false, message: invalidEmailOrPassword };
        }

        const user = result[0];

        // ✅ If user registered with Google
        if (user.provider && user.provider.toLowerCase() === 'google') {
            return {
                status: false,
                message: 'This user is registered with Google. Please login with Google, or forget your password to login normally.',
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { status: false, message: invalidEmailOrPassword };
        }

        return { status: true, user };
    }

    async statusUser(email: string): Promise<UserSchema | null> {
        const query = 'SELECT * FROM users WHERE email = ? AND status = "Enable" LIMIT 1';
        const result = await this.dataSource.query(query, [email]);
        return result.length > 0 ? result[0] : null;
    }

    async login(loginDTO: LoginDTO): Promise<any> {
        try {
            const validation = await this.validateUser(loginDTO.email, loginDTO.password);

            if (!validation.status) {
                return {
                    status: false,
                    message: validation.message,
                };
            }

            const user = validation.user;

            const userStatus = await this.statusUser(loginDTO.email);
            if (!userStatus) {
                return {
                    status: false,
                    message: yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount,
                };
            }

            const accessToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '1h' }
            );

            const updateQuery = 'UPDATE users SET accessToken = ? WHERE id = ?';
            const result: any = await this.dataSource.query(updateQuery, [accessToken, user.id]);

            if (!result || result.affectedRows === 0) {
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

    async getUserById(id: number): Promise<any> {
        const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
        const result = await this.dataSource.query(query, [id]);
        return result.length > 0 ? result[0] : null;
    }
}

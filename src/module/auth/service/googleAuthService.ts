import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { userLoginWasSuccessfulWelcomeBack } from '../common/authMessage';

@Injectable()
export class GoogleAuthService {
    constructor(private readonly dataSource: DataSource) { }

    private normalizeGoogleUser(oauthUser: any) {
        return {
            email: oauthUser?.email || null,
            firstName: oauthUser?.firstName || '',
            lastName: oauthUser?.lastName || '',
            profileImageURL: oauthUser?.profileImageURL || '',
            provider: 'google',
            providerId: oauthUser?.providerId,
        };
    }

    async login(oauthUser: any): Promise<any> {
        const { email, firstName, lastName, profileImageURL, provider, providerId } =
            this.normalizeGoogleUser(oauthUser);

        let user: any;
        let result: any[] = [];

        if (email) {
            result = await this.dataSource.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
        }

        if (result.length === 0 && providerId) {
            result = await this.dataSource.query(
                'SELECT * FROM users WHERE provider = ? AND providerId = ? LIMIT 1',
                [provider, providerId],
            );
        }

        if (result.length === 0) {
            const insertQuery = `
        INSERT INTO users (email, firstName, lastName, profileImageURL, provider, providerId, status, roleId, mobileNo, password, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, "Enable", ?, ?, NULL, NOW())
      `;
            const insertResult = await this.dataSource.query(insertQuery, [
                email,
                firstName,
                lastName,
                profileImageURL,
                provider,
                providerId,
                3,
                '',
            ]);

            user = {
                id: insertResult.insertId,
                email,
                firstName,
                lastName,
                profileImageURL,
                provider,
                providerId,
                status: 'Enable',
                roleId: 3,
            };
        } else {
            user = result[0];
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await this.dataSource.query('UPDATE users SET accessToken = ? WHERE id = ?', [accessToken, user.id]);

        return {
            status: true,
            message: userLoginWasSuccessfulWelcomeBack,
            data: { ...user, accessToken },
        };
    }
}

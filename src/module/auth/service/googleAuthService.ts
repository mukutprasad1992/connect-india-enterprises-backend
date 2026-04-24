import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  accessTokenUpdatedUserId,
  anErrorOccurredDuringGoogleLogin,
  errorInGoogleLoginEmail,
  existingUserFoundUserId,
  googleLoginRequestReceivedEmail,
  newUserCreatedUserId,
  noExistingUserFoundCreatingNewUserEmail,
  userLoginWasSuccessfulWelcomeBack,
  userLookupByEmailEmail,
  userLookupByProviderProvider,
} from '../common/authMessage';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

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
    const {
      email,
      firstName,
      lastName,
      profileImageURL,
      provider,
      providerId,
    } = this.normalizeGoogleUser(oauthUser);

    this.logger.doLog(
      `${googleLoginRequestReceivedEmail} ${email}, providerId: ${providerId}`,
      'success',
    );

    let user: any;
    let result: any[] = [];

    try {
      if (email) {
        result = await this.dataSource.query(
          'SELECT * FROM users WHERE email = ? LIMIT 1',
          [email],
        );
        this.logger.doLog(
          `${userLookupByEmailEmail} ${email}, found: ${result.length}`,
          'success',
        );
      }

      if (result.length === 0 && providerId) {
        result = await this.dataSource.query(
          'SELECT * FROM users WHERE provider = ? AND providerId = ? LIMIT 1',
          [provider, providerId],
        );
        this.logger.doLog(
          `${userLookupByProviderProvider} ${provider}, providerId: ${providerId}, found: ${result.length}`,
          'success',
        );
      }

      if (result.length === 0) {
        this.logger.doLog(
          `${noExistingUserFoundCreatingNewUserEmail} ${email}`,
          'success',
        );

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
          3, // roleId default
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
        this.logger.doLog(`${newUserCreatedUserId} ${user.id}`, 'success');
      } else {
        user = result[0];
        this.logger.doLog(`${existingUserFoundUserId} ${user.id}`, 'success');
      }

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' },
      );
      await this.dataSource.query(
        'UPDATE users SET accessToken = ? WHERE id = ?',
        [accessToken, user.id],
      );
      this.logger.doLog(`${accessTokenUpdatedUserId} ${user.id}`, 'success');

      return {
        status: true,
        message: userLoginWasSuccessfulWelcomeBack,
        data: { ...user, accessToken },
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorInGoogleLoginEmail} ${email}, providerId: ${providerId}, Error: ${error.message}`,
        'fail',
      );
      return {
        status: false,
        message: anErrorOccurredDuringGoogleLogin,
        error: error.message,
      };
    }
  }
}

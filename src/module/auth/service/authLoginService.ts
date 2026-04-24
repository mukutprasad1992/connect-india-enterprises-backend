import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDTO } from '../authDTO/loginAuthDTO';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  userLoginWasSuccessfulWelcomeBack,
  anErrorOccurredDuringTheAccessTokenUpdate,
  anErrorOccurredDuringLoginPleaseTryAgain,
  invalidEmailOrPassword,
  yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount,
  validatingUserEmail,
  invalidLoginAttemptEmail,
  googleProviderLoginAttemptEmail,
  thisUserIsegisteredWithGooglePleaseLoginWithGoogleOrForgetYourPasswordToLoginNormally,
  invalidPasswordAttemptEmail,
  userValidatedSuccessfullyEmail,
  loginAttemptEmail,
  loginFailedEmail,
  blockedUserLoginAttemptEmail,
  failedToUpdateAccessTokenUserId,
  loginSuccessfulUserId,
  errorDuringLoginEmail,
  fetchingUserById,
  userNotFoundId,
  userRetrievedSuccessfullyId,
} from '../common/authMessage';

@Injectable()
export class LoginService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ status: boolean; message?: string; user?: UserSchema }> {
    this.logger.doLog(`${validatingUserEmail} ${email}`, 'success');

    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const result = await this.dataSource.query(query, [email]);

    if (result.length === 0) {
      this.logger.doLog(`${invalidLoginAttemptEmail} ${email}`, 'fail');
      return { status: false, message: invalidEmailOrPassword };
    }

    const user = result[0];

    if (user.provider && user.provider.toLowerCase() === 'google') {
      this.logger.doLog(`${googleProviderLoginAttemptEmail} ${email}`, 'fail');
      return {
        status: false,
        message:
          thisUserIsegisteredWithGooglePleaseLoginWithGoogleOrForgetYourPasswordToLoginNormally,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.doLog(`${invalidPasswordAttemptEmail} ${email}`, 'fail');
      return { status: false, message: invalidEmailOrPassword };
    }

    this.logger.doLog(`${userValidatedSuccessfullyEmail} ${email}`, 'success');
    return { status: true, user };
  }

  async statusUser(email: string): Promise<UserSchema | null> {
    const query =
      'SELECT * FROM users WHERE email = ? AND status = "Enable" LIMIT 1';
    const result = await this.dataSource.query(query, [email]);
    return result.length > 0 ? result[0] : null;
  }

  async login(loginDTO: LoginDTO): Promise<any> {
    const email = loginDTO.email;
    this.logger.doLog(`${loginAttemptEmail} ${email}`, 'success');

    try {
      const validation = await this.validateUser(email, loginDTO.password);

      if (!validation.status) {
        this.logger.doLog(
          `${loginFailedEmail} ${email}. Reason: ${validation.message}`,
          'fail',
        );
        return { status: false, message: validation.message };
      }

      const user = validation.user;
      const userStatus = await this.statusUser(email);

      if (!userStatus) {
        this.logger.doLog(`${blockedUserLoginAttemptEmail} ${email}`, 'fail');
        return {
          status: false,
          message:
            yourAccountIsBlockedPleaseContactTheAdminToActivateYourAccount,
        };
      }

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' },
      );

      const updateQuery = 'UPDATE users SET accessToken = ? WHERE id = ?';
      const result: any = await this.dataSource.query(updateQuery, [
        accessToken,
        user.id,
      ]);

      if (!result || result.affectedRows === 0) {
        this.logger.doLog(
          `${failedToUpdateAccessTokenUserId} ${user.id}`,
          'fail',
        );
        return {
          status: false,
          message: anErrorOccurredDuringTheAccessTokenUpdate,
        };
      }

      this.logger.doLog(`${loginSuccessfulUserId} ${user.id}`, 'success');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return {
        status: true,
        message: userLoginWasSuccessfulWelcomeBack,
        data: { ...userWithoutPassword, accessToken },
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorDuringLoginEmail} ${email}. Error: ${error.message}`,
        'fail',
      );
      return {
        status: false,
        message: anErrorOccurredDuringLoginPleaseTryAgain,
        error: error.message,
      };
    }
  }

  async getUserById(id: number): Promise<any> {
    this.logger.doLog(`${fetchingUserById} ${id}`, 'success');

    const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const result = await this.dataSource.query(query, [id]);

    if (!result || result.length === 0) {
      this.logger.doLog(`${userNotFoundId} ${id}`, 'fail');
      return null;
    }

    this.logger.doLog(`${userRetrievedSuccessfullyId} ${id}`, 'success');
    return result[0];
  }
}

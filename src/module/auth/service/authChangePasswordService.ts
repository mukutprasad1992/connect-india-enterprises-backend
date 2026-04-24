import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDTO } from '../authDTO/changePasswordDTO';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  inCurrectOldPassword,
  passwordChangedSuccessfully,
  anErrorOccurredWhileChangingYourPassword,
  validatingUserPorPasswordChangeUserId,
  userNotFoundId,
  incorrectOldPasswordUserId,
  userValidatedSuccessfullyUserId,
  passwordChangeRequestReceivedUserId,
  passwordChangeFailedIncorrectOldPasswordUserId,
  failedToUpdatePasswordUserId,
  passwordChangedSuccessfullyUserId,
  errorDuringPasswordChangeUserId,
} from '../common/authMessage';

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async validateUser(
    userId: string,
    oldPassword: string,
  ): Promise<UserSchema | null> {
    this.logger.doLog(
      `${validatingUserPorPasswordChangeUserId} ${userId}`,
      'success',
    );

    const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const result = await this.dataSource.query(query, [userId]);

    if (result.length === 0) {
      this.logger.doLog(`${userNotFoundId} ${userId}`, 'fail');
      return null;
    }

    const user = result[0];

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      this.logger.doLog(`${incorrectOldPasswordUserId} ${userId}`, 'fail');
      return null;
    }

    this.logger.doLog(
      `${userValidatedSuccessfullyUserId} ${userId}`,
      'success',
    );

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
      updatedBy: user.updatedBy,
    };
  }

  async changePassword(
    id: string,
    changePasswordDTO: ChangePasswordDTO,
  ): Promise<any> {
    this.logger.doLog(
      `${passwordChangeRequestReceivedUserId} ${id}`,
      'success',
    );

    try {
      const user = await this.validateUser(id, changePasswordDTO.oldPassword);

      if (!user) {
        this.logger.doLog(
          `${passwordChangeFailedIncorrectOldPasswordUserId} ${id}`,
          'fail',
        );
        return {
          status: false,
          message: inCurrectOldPassword,
          data: null,
        };
      }

      const hashedNewPassword = bcrypt.hashSync(
        changePasswordDTO.newPassword,
        10,
      );
      const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
      const response = await this.dataSource.query(updateQuery, [
        hashedNewPassword,
        id,
      ]);

      if (!response) {
        this.logger.doLog(`${failedToUpdatePasswordUserId} ${id}`, 'fail');
        return {
          status: false,
          message: anErrorOccurredWhileChangingYourPassword,
        };
      }

      this.logger.doLog(
        `${passwordChangedSuccessfullyUserId} ${id}`,
        'success',
      );

      return {
        status: true,
        message: passwordChangedSuccessfully,
        data: user,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorDuringPasswordChangeUserId} ${id}. Error: ${error.message}`,
        'fail',
      );

      return {
        status: false,
        message: anErrorOccurredWhileChangingYourPassword,
        error: error.message,
      };
    }
  }
}

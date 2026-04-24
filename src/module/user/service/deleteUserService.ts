import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { DataSource, Repository } from 'typeorm';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  userNotFound,
  userSuccessfullyDeleted,
  errorOccurredWhileDeletingTheUser,
  attemptingToDeleteUserWithId,
  userNotFoundWithId,
  userDeletedSuccessfullyWithId,
  errorOccurredWhileDeletingUserWithId,
} from '../common/userMessage';

@Injectable()
export class DeleteUserService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    private dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async delete(userId: number): Promise<any> {
    const query = 'DELETE FROM users WHERE id = ?';
    const values = [userId];

    this.logger.doLog(`${attemptingToDeleteUserWithId} ${userId}`, 'info');

    try {
      const deleteResult = await this.dataSource.query(query, values);

      if (deleteResult.affectedRows === 0) {
        this.logger.doLog(`${userNotFoundWithId} ${userId}`, 'warn');
        return {
          status: false,
          message: userNotFound,
          data: null,
        };
      } else {
        this.logger.doLog(
          `${userDeletedSuccessfullyWithId} ${userId}`,
          'success',
        );
        return {
          status: true,
          message: userSuccessfullyDeleted,
        };
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileDeletingUserWithId} ${userId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: errorOccurredWhileDeletingTheUser,
        data: null,
      };
    }
  }
}

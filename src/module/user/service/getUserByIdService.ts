import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  anErrorOccurredWhileRetrievingTheUser,
  userRetrievedSuccessfully,
  userNotFound,
  fetchingUserWithId,
  userRetrievedSuccessfullyWithId,
  userNotFoundWithId,
  errorOccurredWhileRetrievingUserWithId,
} from '../common/userMessage';

@Injectable()
export class GetUserByIdService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    private readonly logger: AppLogger,
  ) {}

  async getUserById(id: number): Promise<any> {
    this.logger.doLog(`${fetchingUserWithId} ${id}`, 'info');

    try {
      const query = 'SELECT * FROM users WHERE id = ? ORDER BY id DESC';
      const user = await this.userRepository.query(query, [id]);

      if (user.length > 0) {
        this.logger.doLog(
          `${userRetrievedSuccessfullyWithId} ${id}`,
          'success',
        );
        return {
          status: true,
          message: userRetrievedSuccessfully,
          data: user[0],
        };
      } else {
        this.logger.doLog(`${userNotFoundWithId} ${id}`, 'warn');
        return {
          status: false,
          message: userNotFound,
          data: null,
        };
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileRetrievingUserWithId} ${id}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileRetrievingTheUser,
        data: null,
      };
    }
  }
}

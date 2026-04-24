import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { prepareUpdateFields } from '../common/common';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  errorOccurredWhileUpdatingUserId,
  noFieldsToUpdateOrUserNotFoundForId,
  startingUpdateForUserId,
  userNotFoundOrNoChangesAppliedForId,
  userNotFoundOrNoFieldsWereUpdated,
  userUpdatedSuccessfully,
  userUpdatedSuccessfullyWithId,
} from '../common/userMessage';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    private dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async updateUser(
    id: number,
    updateData: UpdateUserDTO,
    userId: number,
  ): Promise<any> {
    this.logger.doLog(`${startingUpdateForUserId} ${id}`, 'info');

    try {
      const updateFields = await prepareUpdateFields(updateData, userId);

      if (updateFields.isEmpty) {
        this.logger.doLog(
          `${noFieldsToUpdateOrUserNotFoundForId} ${id}`,
          'warn',
        );
        return {
          status: false,
          message: userNotFoundOrNoFieldsWereUpdated,
          data: null,
        };
      }

      const query = this.buildUpdateQuery(updateFields.fields);
      updateFields.values.push(id);

      const updateResult = await this.executeUpdateQuery(
        query,
        updateFields.values,
      );
      if (updateResult.changedRows === 0) {
        this.logger.doLog(
          `${userNotFoundOrNoChangesAppliedForId} ${id}`,
          'warn',
        );
        return {
          status: false,
          message: userNotFoundOrNoFieldsWereUpdated,
          data: null,
        };
      }

      const updatedUser = await this.getUpdatedUser(id);
      this.logger.doLog(`${userUpdatedSuccessfullyWithId} ${id}`, 'success');

      return {
        status: true,
        message: userUpdatedSuccessfully,
        data: updatedUser,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileUpdatingUserId} ${id}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: error.message,
        data: null,
      };
    }
  }

  private buildUpdateQuery(fields: string[]): string {
    return `UPDATE users 
                SET ${fields.join(', ')} 
                WHERE id = ?`;
  }

  private async executeUpdateQuery(query: string, values: any[]): Promise<any> {
    return await this.dataSource.query(query, values);
  }

  private async getUpdatedUser(id: number): Promise<any> {
    const result = await this.dataSource.query(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );
    return result[0];
  }
}

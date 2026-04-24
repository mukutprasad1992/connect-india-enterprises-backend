import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  anErrorOccurredWhileRetrievingServiceSubType,
  anErrorOccurredWhileUpdatingServiceSubType,
  byUserID,
  errorRetrievingServiceSubTypeForID,
  errorUpdatingServiceSubTypeID,
  fetchingServiceSubTypeByID,
  noServiceSubTypeFoundForID,
  serviceSubTypeNotFound,
  serviceSubTypeNotFoundForUpdateID,
  serviceSubTypeRetrievalSuccessfully,
  serviceSubTypeRetrievedSuccessfullyForID,
  serviceSubTypeUpdatedSuccessfullyForID,
  serviceSubTypeUpdateQueryExecutedSuccessfullyForID,
  serviceSubTypeUpdateSuccessfully,
  updatingServiceSubTypeID,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UpdateServiceSubTypeByIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async updateServiceSubTypeById(ledgerId: number): Promise<any> {
    this.logger.doLog(`${fetchingServiceSubTypeByID} ${ledgerId}`, 'info');

    try {
      const serviceSubType = await this.dataSource.query(
        'SELECT * FROM serviceSubTypes WHERE id = ?',
        [ledgerId],
      );

      if (!serviceSubType[0]) {
        this.logger.doLog(`${noServiceSubTypeFoundForID} ${ledgerId}`, 'warn');
        return {
          status: false,
          message: serviceSubTypeNotFound,
          data: null,
        };
      } else {
        this.logger.doLog(
          `${serviceSubTypeRetrievedSuccessfullyForID} ${ledgerId}`,
          'success',
        );
        return {
          status: true,
          message: serviceSubTypeRetrievalSuccessfully,
          data: serviceSubType,
        };
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorRetrievingServiceSubTypeForID} ${ledgerId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileRetrievingServiceSubType,
        data: null,
        error: error.message,
      };
    }
  }

  async updateServiceSubType(
    ledgerId: number,
    updatedData: any,
    userId: number,
  ): Promise<any> {
    this.logger.doLog(
      `${updatingServiceSubTypeID} ${ledgerId} ${byUserID} ${userId}`,
      'info',
    );

    try {
      const updatedBy = userId;
      const profile = await this.updateServiceSubTypeById(ledgerId);

      if (!profile || !profile.data) {
        this.logger.doLog(
          `${serviceSubTypeNotFoundForUpdateID} ${ledgerId}`,
          'warn',
        );
        return {
          status: false,
          message: serviceSubTypeNotFound,
          data: null,
        };
      }

      const { ledgerType } = updatedData;
      const query = `UPDATE serviceSubTypes 
               SET ledgerType = ?, updatedBy = ?, updatedAt = now()
               WHERE id = ?`;
      const values = [ledgerType, updatedBy, ledgerId];

      await this.dataSource.query(query, values);
      this.logger.doLog(
        `${serviceSubTypeUpdateQueryExecutedSuccessfullyForID} ${ledgerId}`,
        'info',
      );

      const updatedProfile = await this.updateServiceSubTypeById(ledgerId);

      this.logger.doLog(
        `${serviceSubTypeUpdatedSuccessfullyForID} ${ledgerId}`,
        'success',
      );
      return {
        status: true,
        message: serviceSubTypeUpdateSuccessfully,
        data: updatedProfile.data,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorUpdatingServiceSubTypeID} ${ledgerId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileUpdatingServiceSubType,
        error: error.message,
      };
    }
  }
}

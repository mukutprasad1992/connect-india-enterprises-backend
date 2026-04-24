import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  anErrorOccurredWhileRetrievingServiceSubType,
  errorRetrievingServiceSubTypeForID,
  noServiceSubTypeFoundForID,
  serviceSubTypeNotFound,
  serviceSubTypeRetrievalSuccessfully,
  serviceSubTypeRetrievedSuccessfullyForID,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetByServiceSubTypeIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getServiceSubTypeById(ledgerId: number): Promise<any> {
    this.logger.doLog(`${noServiceSubTypeFoundForID} ${ledgerId}`, 'info');

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
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  anErrorOccurredWhileRetrievingServiceSubType,
  errorRetrievingServiceSubTypesForServiceId,
  fetchingServiceSubTypesForServiceId,
  noServiceSubTypesFoundForServiceId,
  serviceSubTypeNotFound,
  serviceSubTypeRetrievalSuccessfully,
  serviceSubTypesRetrievedSuccessfullyForServiceId,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetServiceSubTypeByServiceIdService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getServiceSubTypeByServiceId(ServiceId: number): Promise<any> {
    this.logger.doLog(
      `${fetchingServiceSubTypesForServiceId} ${ServiceId}`,
      'info',
    );

    try {
      const serviceSubType = await this.dataSource.query(
        'SELECT * FROM serviceSubTypes WHERE serviceId = ?',
        [ServiceId],
      );

      if (!serviceSubType[0]) {
        this.logger.doLog(
          `${noServiceSubTypesFoundForServiceId} ${ServiceId}`,
          'warn',
        );
        return {
          status: false,
          message: serviceSubTypeNotFound,
          data: null,
        };
      } else {
        this.logger.doLog(
          `${serviceSubTypesRetrievedSuccessfullyForServiceId} ${ServiceId}, count: ${serviceSubType.length}`,
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
        `${errorRetrievingServiceSubTypesForServiceId} ${ServiceId}, error: ${error.message}`,
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

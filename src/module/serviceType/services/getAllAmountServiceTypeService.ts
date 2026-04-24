import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  errorRetrievingTotalAmount,
  fetchingTotalAmountForServiceId,
  noTotalAmountFound,
  noTotalAmountFoundForServiceId,
  runningTotalAmountQueryForServiceId,
  serviceTypeTotalAmountRetrievalError,
  serviceTypeTotalAmountRetrievedSuccessfully,
  totalAmountRetrievedForServiceId,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetTotalAmountServiceTypeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  private async fetchTotalAmountByServiceId(
    serviceId: number,
  ): Promise<{ totalAmount: number; totalServices: number } | null> {
    const query = `
      SELECT 
        SUM(amount) AS totalAmount,
        COUNT(*) AS totalServices
      FROM servicetypes
      WHERE serviceId = ?
    `;
    this.logger.doLog(
      `${runningTotalAmountQueryForServiceId} = ${serviceId}`,
      'success',
    );
    const result = await this.dataSource.query(query, [serviceId]);
    return result && result.length > 0 ? result[0] : null;
  }

  async getTotalAmountServiceType(serviceId: number): Promise<any> {
    try {
      this.logger.doLog(
        `${fetchingTotalAmountForServiceId} = ${serviceId}`,
        'success',
      );
      const response = await this.fetchTotalAmountByServiceId(serviceId);

      if (!response || response.totalAmount === null) {
        this.logger.doLog(
          `${noTotalAmountFoundForServiceId} = ${serviceId}`,
          'fail',
        );
        return {
          status: false,
          message: noTotalAmountFound,
        };
      }

      this.logger.doLog(
        `${totalAmountRetrievedForServiceId} = ${serviceId}: ${response.totalAmount}, services=${response.totalServices}`,
        'success',
      );

      return {
        status: true,
        message: serviceTypeTotalAmountRetrievedSuccessfully,
        data: response,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorRetrievingTotalAmount} ${error.message}`,
        'fail',
      );
      return {
        status: false,
        message: serviceTypeTotalAmountRetrievalError,
        error: error.message,
      };
    }
  }
}

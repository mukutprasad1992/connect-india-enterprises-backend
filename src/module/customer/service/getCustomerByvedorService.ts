import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  anErrorOccurredWhileFetchingCustomers,
  customerNotFound,
  customersForVendorId,
  customersRetrievedSuccessfully,
  errorFetchingVendorById,
  errorFetchingVendorWithID,
  errorWhileFetchingCustomersForVendorId,
  fetchingAllCustomersForVendorId,
  fetchingVendorByVendorId,
  noCustomersFoundForVendorId,
  successfullyRetrieved,
  vendorFound,
  vendorNotFound,
  vendorNotFoundForVendorId,
  vendorRetrievedSuccessfullyForVendorId,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllCustomersByVenderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getAllCustomersByVendor(vendorId: number): Promise<any> {
    this.logger.doLog(`${fetchingAllCustomersForVendorId} ${vendorId}`, 'info');
    try {
      const vendor = await this.getVendorById(vendorId);

      if (!vendor || Object.keys(vendor).length === 0) {
        this.logger.doLog(`${vendorNotFoundForVendorId} ${vendorId}`, 'warn');
        return {
          status: false,
          message: vendorNotFound,
        };
      }

      this.logger.doLog(
        `${vendorFound} ${vendor.businessName || vendor.id}`,
        'success',
      );

      const customers = await this.dataSource.query(
        'SELECT * FROM customers WHERE vendorId = ? ORDER BY id DESC',
        [vendorId],
      );

      if (!customers || customers.length === 0) {
        this.logger.doLog(`${noCustomersFoundForVendorId} ${vendorId}`, 'warn');
        return {
          status: false,
          message: customerNotFound,
          data: null,
        };
      }

      this.logger.doLog(
        `${successfullyRetrieved} ${customers.length} ${customersForVendorId} ${vendorId}`,
        'success',
      );
      return {
        status: true,
        message: customersRetrievedSuccessfully,
        data: customers,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileFetchingCustomersForVendorId} ${vendorId} - ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileFetchingCustomers,
        error: error.message,
      };
    }
  }

  private async getVendorById(vendorId: number): Promise<any> {
    this.logger.doLog(`${fetchingVendorByVendorId} ${vendorId}`, 'info');
    try {
      const vendor = await this.dataSource.query(
        'SELECT * FROM users WHERE id = ?',
        [vendorId],
      );
      if (vendor && vendor.length > 0) {
        this.logger.doLog(
          `${vendorRetrievedSuccessfullyForVendorId} ${vendorId}`,
          'success',
        );
        return vendor[0];
      } else {
        this.logger.doLog(`${vendorNotFoundForVendorId} ${vendorId}`, 'warn');
        return null;
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingVendorWithID} ${vendorId}: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: errorFetchingVendorById,
        error: error.message,
      };
    }
  }
}

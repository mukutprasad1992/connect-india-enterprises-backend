import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  anErrorOccurredWhileFetchingCustomers,
  customerNotFound,
  customersRetrievedSuccessfully,
  customersRetrievedSuccessfullyForUserId,
  errorFetchingCustomersForUserId,
  errorFetchingUserWithID,
  fetchingAllCustomersForUserId,
  fetchingUserByID,
  noCustomersFoundForUserId,
  userFoundUserId,
  vendorFoundWithId,
  vendorNotFound,
  vendorNotFoundForUserId,
  vendorNotFoundWithId,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetAllCustomerService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getAllCustomer(userId: number): Promise<any> {
    this.logger.doLog(`${fetchingAllCustomersForUserId} ${userId}`, 'info');
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        this.logger.doLog(`${vendorNotFoundForUserId} ${userId}`, 'warn');
        return {
          status: false,
          message: vendorNotFound,
        };
      }

      const { roleId } = user;
      this.logger.doLog(
        `${userFoundUserId} ${userId}, roleId: ${roleId}`,
        'info',
      );

      const query = `
                SELECT 
                  c.id, c.name, c.address, c.phone, c.email, c.pincode,
                  u.businessName, u.businessRepresentative
                FROM customers c
                JOIN users u ON c.vendorId = u.id
                ${roleId === 2 ? 'WHERE c.vendorId = ?' : ''}
            `;

      const customers = await this.dataSource.query(
        query,
        roleId === 2 ? [userId] : [],
      );

      if (customers.length === 0) {
        this.logger.doLog(`${noCustomersFoundForUserId} ${userId}`, 'warn');
        return {
          status: false,
          message: customerNotFound,
        };
      }

      this.logger.doLog(
        `${customersRetrievedSuccessfullyForUserId} ${userId}, count: ${customers.length}`,
        'success',
      );
      return {
        status: true,
        message: customersRetrievedSuccessfully,
        data: customers,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingCustomersForUserId} ${userId} - ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileFetchingCustomers,
        error: error.message,
      };
    }
  }

  private async getUserById(id: number): Promise<any> {
    this.logger.doLog(`${fetchingUserByID} ${id}`, 'info');
    try {
      const result = await this.dataSource.query(
        'SELECT roleId FROM users WHERE id = ?',
        [id],
      );
      this.logger.doLog(
        result.length > 0
          ? `${vendorFoundWithId} ${id}, roleId: ${result[0].roleId}`
          : `${vendorNotFoundWithId} ${id}`,
        result.length > 0 ? 'success' : 'warn',
      );
      return result.length > 0 ? result[0] : null;
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingUserWithID} ${id}: ${error.message}`,
        'error',
      );
      return null;
    }
  }
}

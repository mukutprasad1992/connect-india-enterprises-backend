import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  errorretrievingTotalAmountsForUserId,
  fetchedInsuranceTotal,
  fetchedInvestmentTotal,
  fetchedLoanTotal,
  fetchedPoliciesTotal,
  forUserId,
  noServiceDataFoundForUserId,
  roleNotFoundForUserId,
  serviceTypeNotFound,
  serviceTypeTotalAmountRetrievalError,
  serviceTypeTotalAmountRetrievedSuccessfully,
  serviceTypeTotalsRetrievedSuccessfullyForUserId,
  unauthorizedRole,
  unauthorizedRoleAccessUserId,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetTotalAmountsAndServicesByUserIdServiceTypeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getTotalAmountServiceTypeById(userId: number): Promise<any> {
    try {
      const roleId = await this.getUserRoleId(userId);
      if (roleId === null) {
        this.logger.doLog(`${roleNotFoundForUserId} = ${userId}`, 'fail');
        return this.createFailureResponse(serviceTypeNotFound);
      }

      const isAdmin = roleId === 1;
      const isAgent = roleId === 3;

      if (!isAdmin && !isAgent) {
        this.logger.doLog(
          `${unauthorizedRoleAccessUserId} = ${userId}, roleId=${roleId}`,
          'fail',
        );
        return this.createFailureResponse(unauthorizedRole);
      }

      // Fetch totals
      const investment = await this.fetchTotalInvestment(
        isAdmin ? null : userId,
      );
      const policy = await this.fetchTotalPolicies(isAdmin ? null : userId);
      const insurance = await this.fetchTotalInsurance(isAdmin ? null : userId);
      const loan = await this.fetchTotalLoan(isAdmin ? null : userId);

      const totals = {
        investmentTotalServices: investment.total_approved,
        policyTotalServices: policy.total_approved,
        insuranceTotalServices: insurance.total_approved,
        loanTotalServices: loan.total_approved,
      };

      if (!this.hasServiceData(totals)) {
        this.logger.doLog(`${noServiceDataFoundForUserId} = ${userId}`, 'fail');
        return this.createFailureResponse(serviceTypeNotFound);
      }

      const formattedData = this.formatResponseData(totals);
      this.logger.doLog(
        `${serviceTypeTotalsRetrievedSuccessfullyForUserId} = ${userId}`,
        'success',
      );
      return this.createSuccessResponse(
        serviceTypeTotalAmountRetrievedSuccessfully,
        formattedData,
      );
    } catch (error: any) {
      this.logger.doLog(
        `${errorretrievingTotalAmountsForUserId}= ${userId} error = ${error?.message} `,
        'fail',
      );
      return this.createErrorResponse(
        serviceTypeTotalAmountRetrievalError,
        error?.message || 'Unknown error',
      );
    }
  }

  private async getUserRoleId(userId: number): Promise<number | null> {
    const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
    const result = await this.dataSource.query(query, [userId]);
    this.logger.doLog(
      result.length > 0
        ? `Fetched roleId = ${result[0].roleId} for userId = ${userId}`
        : `No role found for userId = ${userId}`,
      result.length > 0 ? 'success' : 'fail',
    );
    return result.length > 0 ? result[0].roleId : null;
  }

  private async fetchTotalInvestment(userId: number | null): Promise<any> {
    const query = `
            SELECT COUNT(*) AS total_approved
            FROM investmentdetails idt
            LEFT JOIN servicerequests sr ON idt.serviceRequestId = sr.id
            WHERE idt.status = 'Approved'
            ${userId ? 'AND sr.userId = ?' : ''}
            `;
    const params = userId ? [userId] : [];
    const result = await this.dataSource.query(query, params);
    this.logger.doLog(
      `${fetchedInvestmentTotal} = ${result[0].total_approved} ${forUserId} = ${userId || 'ALL'}`,
      'success',
    );
    return result[0];
  }

  private async fetchTotalPolicies(userId: number | null): Promise<any> {
    const query = `
            SELECT COUNT(*) AS total_approved
            FROM insurancedetails pd
            LEFT JOIN servicerequests sr ON pd.serviceRequestId = sr.id
            WHERE pd.status = 'Approved'
            ${userId ? 'AND sr.userId = ?' : ''}
        `;
    const params = userId ? [userId] : [];
    const result = await this.dataSource.query(query, params);
    this.logger.doLog(
      `${fetchedPoliciesTotal} = ${result[0].total_approved} ${forUserId} = ${userId || 'ALL'}`,
      'success',
    );
    return result[0];
  }

  private async fetchTotalInsurance(userId: number | null): Promise<any> {
    const query = `
            SELECT COUNT(*) AS total_approved
            FROM insurancedetails ins
            LEFT JOIN servicerequests sr ON ins.serviceRequestId = sr.id
            WHERE ins.status = 'Approved'
            ${userId ? 'AND sr.userId = ?' : ''}
`;
    const params = userId ? [userId] : [];
    const result = await this.dataSource.query(query, params);
    this.logger.doLog(
      `${fetchedInsuranceTotal} = ${result[0].total_approved} ${forUserId} = ${userId || 'ALL'}`,
      'success',
    );
    return result[0];
  }

  private async fetchTotalLoan(userId: number | null): Promise<any> {
    const query = `
            SELECT COUNT(*) AS total_approved
            FROM loandetails ld
            LEFT JOIN servicerequests sr ON ld.serviceRequestId = sr.id
            WHERE ld.status = 'Approved'
            ${userId ? 'AND sr.userId = ?' : ''}
`;
    const params = userId ? [userId] : [];
    const result = await this.dataSource.query(query, params);
    this.logger.doLog(
      `${fetchedLoanTotal} = ${result[0].total_approved} ${forUserId} = ${userId || 'ALL'}`,
      'success',
    );
    return result[0];
  }

  private hasServiceData(result: any): boolean {
    return (
      result.investmentTotalServices > 0 ||
      result.policyTotalServices > 0 ||
      result.insuranceTotalServices > 0 ||
      result.loanTotalServices > 0
    );
  }

  private formatResponseData(result: any) {
    const totalInvestmentAmount = 123400;
    const totalPolicyAmount = 223400;
    const totalInsuranceAmount = 323400;
    const totalLoanAmount = 33400;
    return {
      Investment: {
        totalServices: result.investmentTotalServices,
        totalAmount: totalInvestmentAmount,
      },
      Policy: {
        totalServices: result.policyTotalServices,
        totalAmount: totalPolicyAmount,
      },
      Insurance: {
        totalServices: result.insuranceTotalServices,
        totalAmount: totalInsuranceAmount,
      },
      Loan: {
        totalServices: result.loanTotalServices,
        totalAmount: totalLoanAmount,
      },
    };
  }

  private createSuccessResponse(message: string, data: any) {
    return { status: true, message, data };
  }

  private createFailureResponse(message: string) {
    return { status: false, message };
  }

  private createErrorResponse(message: string, error: string) {
    return { status: false, message, error };
  }
}

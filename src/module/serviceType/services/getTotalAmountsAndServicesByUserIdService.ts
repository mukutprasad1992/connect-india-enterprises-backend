import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeTotalAmountRetrievalError,
    serviceTypeTotalAmountRetrievedSuccessfully,
    unauthorizedRole,
} from '../common/serviceTypeMessage';

@Injectable()
export class GetTotalAmountsAndServicesByUserIdServiceTypeService {
    constructor(private readonly dataSource: DataSource) { }

    async getTotalAmountServiceTypeById(userId: number): Promise<any> {
        try {
            const roleId = await this.getUserRoleId(userId);
            if (roleId === null) return this.createFailureResponse(serviceTypeNotFound);

            const isAdmin = roleId === 1;
            const isAgent = roleId === 3;

            if (!isAdmin && !isAgent) return this.createFailureResponse(unauthorizedRole);

            // Fetch totals using serviceRequestId -> userId
            const investment = await this.fetchTotalInvestment(isAdmin ? null : userId);
            const policy = await this.fetchTotalPolicies(isAdmin ? null : userId);
            const insurance = await this.fetchTotalInsurance(isAdmin ? null : userId);
            const loan = await this.fetchTotalLoan(isAdmin ? null : userId);

            const totals = {
                investmentTotalServices: investment.total_approved,
                policyTotalServices: policy.total_approved,
                insuranceTotalServices: insurance.total_approved,
                loanTotalServices: loan.total_approved,
            };

            if (!this.hasServiceData(totals)) return this.createFailureResponse(serviceTypeNotFound);

            const formattedData = this.formatResponseData(totals);
            return this.createSuccessResponse(serviceTypeTotalAmountRetrievedSuccessfully, formattedData);
        } catch (error) {
            return this.createErrorResponse(serviceTypeTotalAmountRetrievalError, error?.message || 'Unknown error');
        }
    }

    private async getUserRoleId(userId: number): Promise<number | null> {
        const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
        const result = await this.dataSource.query(query, [userId]);
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
        return {
            Investment: { totalServices: result.investmentTotalServices },
            Policy: { totalServices: result.policyTotalServices },
            Insurance: { totalServices: result.insuranceTotalServices },
            Loan: { totalServices: result.loanTotalServices },
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

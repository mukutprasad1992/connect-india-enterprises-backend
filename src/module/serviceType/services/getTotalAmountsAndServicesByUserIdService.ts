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

            if (roleId === null) {
                return this.createFailureResponse(serviceTypeNotFound);
            }

            const isAdmin = roleId === 1;
            const isAgent = roleId === 3;

            if (!isAdmin && !isAgent) {
                return this.createFailureResponse(unauthorizedRole);
            }

            const totals = await this.fetchTotalAmounts(isAdmin ? null : userId);

            if (!this.hasServiceData(totals)) {
                return this.createFailureResponse(serviceTypeNotFound);
            }

            const formattedData = this.formatResponseData(totals);

            return this.createSuccessResponse(serviceTypeTotalAmountRetrievedSuccessfully, formattedData);
        } catch (error) {
            return this.createErrorResponse(serviceTypeTotalAmountRetrievalError, error.message);
        }
    }

    private async getUserRoleId(userId: number): Promise<number | null> {
        const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
        const result = await this.dataSource.query(query, [userId]);
        return result.length > 0 ? result[0].roleId : null;
    }

    private async fetchTotalAmounts(userId: number | null): Promise<any> {
        const query = `
            SELECT
                -- Investment
                COUNT(CASE WHEN serviceId = 1 AND status = 'Approved' THEN 1 END) AS investmentTotalServices,
                SUM(CASE WHEN serviceId = 1 AND status = 'Approved' THEN amount ELSE 0 END) AS investmentTotalAmount,
                SUM(CASE WHEN serviceId = 1 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN amount ELSE 0 END) AS investmentCurrentMonth,
                SUM(CASE WHEN serviceId = 1 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END) AS investmentPreviousMonth,

                -- Policy
                COUNT(CASE WHEN serviceId = 2 AND status = 'Approved' THEN 1 END) AS policyTotalServices,
                SUM(CASE WHEN serviceId = 2 AND status = 'Approved' THEN amount ELSE 0 END) AS policyTotalAmount,
                SUM(CASE WHEN serviceId = 2 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN amount ELSE 0 END) AS policyCurrentMonth,
                SUM(CASE WHEN serviceId = 2 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END) AS policyPreviousMonth,

                -- Insurance
                COUNT(CASE WHEN serviceId = 3 AND status = 'Approved' THEN 1 END) AS insuranceTotalServices,
                SUM(CASE WHEN serviceId = 3 AND status = 'Approved' THEN amount ELSE 0 END) AS insuranceTotalAmount,
                SUM(CASE WHEN serviceId = 3 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN amount ELSE 0 END) AS insuranceCurrentMonth,
                SUM(CASE WHEN serviceId = 3 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END) AS insurancePreviousMonth,

                -- Loan
                COUNT(CASE WHEN serviceId = 4 AND status = 'Approved' THEN 1 END) AS loanTotalServices,
                SUM(CASE WHEN serviceId = 4 AND status = 'Approved' THEN amount ELSE 0 END) AS loanTotalAmount,
                SUM(CASE WHEN serviceId = 4 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN amount ELSE 0 END) AS loanCurrentMonth,
                SUM(CASE WHEN serviceId = 4 AND status = 'Approved' AND MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH) THEN amount ELSE 0 END) AS loanPreviousMonth
            FROM servicetypes
            WHERE (? IS NULL OR userId = ?)
        `;
        const result = await this.dataSource.query(query, [userId, userId]);
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
        const calculateStats = (current: number, previous: number) => {
            const extra = current - previous;
            const percent = previous === 0 ? 100 : Math.round((extra / previous) * 100);
            return { current, previous, extra, percent };
        };

        return {
            Investment: {
                totalAmount: result.investmentTotalAmount,
                totalServices: result.investmentTotalServices,
                ...calculateStats(result.investmentCurrentMonth, result.investmentPreviousMonth),
            },
            Policy: {
                totalAmount: result.policyTotalAmount,
                totalServices: result.policyTotalServices,
                ...calculateStats(result.policyCurrentMonth, result.policyPreviousMonth),
            },
            Insurance: {
                totalAmount: result.insuranceTotalAmount,
                totalServices: result.insuranceTotalServices,
                ...calculateStats(result.insuranceCurrentMonth, result.insurancePreviousMonth),
            },
            Loan: {
                totalAmount: result.loanTotalAmount,
                totalServices: result.loanTotalServices,
                ...calculateStats(result.loanCurrentMonth, result.loanPreviousMonth),
            },
        };
    }

    private createSuccessResponse(message: string, data: any) {
        return {
            status: true,
            message,
            data,
        };
    }

    private createFailureResponse(message: string) {
        return {
            status: false,
            message,
        };
    }

    private createErrorResponse(message: string, error: string) {
        return {
            status: false,
            message,
            error,
        };
    }
}

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
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }

            let totals;
            if (roleId === 1) {
                totals = await this.fetchTotalAmounts(null);
            } else if (roleId === 3) {
                totals = await this.fetchTotalAmounts(userId);
            } else {
                return {
                    status: false,
                    message: unauthorizedRole,
                };
            }
            if (!this.hasServiceData(totals)) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }
            const data = this.formatResponseData(totals);
            return {
                status: true,
                message: serviceTypeTotalAmountRetrievedSuccessfully,
                data,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeTotalAmountRetrievalError,
                error: error.message,
            };
        }
    }

    private async getUserRoleId(userId: number): Promise<number | null> {
        const query = `SELECT roleId FROM users WHERE id = ? LIMIT 1`;
        const result = await this.dataSource.query(query, [userId]);
        if (result.length > 0) {
            return result[0].roleId;
        }
        return null;
    }

    private async fetchTotalAmounts(userId: number | null): Promise<any> {
        const query = `
            SELECT
                SUM(CASE WHEN serviceId = 1 THEN amount ELSE 0 END) AS investmentTotalAmount,
                COUNT(CASE WHEN serviceId = 1 THEN 1 ELSE NULL END) AS investmentTotalServices,

                SUM(CASE WHEN serviceId = 2 THEN amount ELSE 0 END) AS policyTotalAmount,
                COUNT(CASE WHEN serviceId = 2 THEN 1 ELSE NULL END) AS policyTotalServices,

                SUM(CASE WHEN serviceId = 3 THEN amount ELSE 0 END) AS insuranceTotalAmount,
                COUNT(CASE WHEN serviceId = 3 THEN 1 ELSE NULL END) AS insuranceTotalServices,

                SUM(CASE WHEN serviceId = 4 THEN amount ELSE 0 END) AS loanTotalAmount,
                COUNT(CASE WHEN serviceId = 4 THEN 1 ELSE NULL END) AS loanTotalServices
            FROM servicetypes
            WHERE (? IS NULL OR userId = ?);
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
        return {
            Investment: {
                totalAmount: result.investmentTotalAmount,
                totalServices: result.investmentTotalServices,
            },
            Policy: {
                totalAmount: result.policyTotalAmount,
                totalServices: result.policyTotalServices,
            },
            Insurance: {
                totalAmount: result.insuranceTotalAmount,
                totalServices: result.insuranceTotalServices,
            },
            Loan: {
                totalAmount: result.loanTotalAmount,
                totalServices: result.loanTotalServices,
            },
        };
    }
}

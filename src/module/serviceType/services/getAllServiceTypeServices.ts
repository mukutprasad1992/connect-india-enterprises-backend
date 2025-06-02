import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypesRetrievedSuccessfully,
    youAreNotAdmin
} from '../common/serviceTypeMessage';
@Injectable()
export class GetALLServiceTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }
    async getAllServiceTypesByUser(userId: number): Promise<any> {
        try {
            const roleResult = await this.isAdmin(userId);
            const roleId = roleResult[0]?.roleId;
            if (roleId !== 1) {
                return {
                    status: false,
                    message: youAreNotAdmin
                }
            }
            else {
                const serviceTypes = await this.dataSource.query(
                    `SELECT s.*, u.firstName, u.lastName, u.email, u.mobileNo, u.profileImageURL
                 FROM servicetypes s 
                 LEFT JOIN users u ON u.id = s.userId; `,
                );
                if (serviceTypes.length > 0) {
                    return {
                        status: true,
                        message: serviceTypesRetrievedSuccessfully,
                        data: serviceTypes,
                    };
                }
                else {
                    return {
                        status: false,
                        message: serviceTypeNotFound,
                        data: null,
                    };
                }
            }
        } catch (error) {
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            };
        }
    }
    async isAdmin(userId: number): Promise<any> {
        const id = userId
        const query = `SELECT roleId FROM  users WHERE id = ?;`;

        const result = await this.dataSource.query(
            query,
            [id]
        );
        return result
    }
}
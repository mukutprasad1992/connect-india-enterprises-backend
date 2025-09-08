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
                    `
                           SELECT
                        -- Service Request
                        sr.id,
                        sr.serviceId,
                        sr.serviceSubTypeId,
                                
                        -- User
                        u.id AS userId,
                        u.firstName,
                        u.lastName,
                        u.email AS userEmail,
                                
                        -- Investment
                        inv.id AS investmentId,
                        inv.status,
                        inv.activeSteps,
                        inv.submit,
                        inv.createdAt AS investmentCreatedAt,
                        inv.updatedAt AS investmentUpdatedAt,
                                
                        -- Service SubType
                        sst.ledgerType AS serviceSubTypeName,
                                
                        -- Basic Details
                        bd.id AS basicDetailsId,
                        bd.aadharNumber,
                        bd.panNumber,
                                
                        -- Personal Details
                        pd.id AS personalDetailsId,
                        pd.email AS email,
                        pd.mobile AS mobile,
                        pd.placeOfBirth,
                        pd.income,
                        pd.occupation,
                                
                        -- Nominee Details
                        nd.id AS nomineeDetailsId,
                        nd.nomineeIdType,
                        nd.nomineeId,
                        nd.nomineeMobile,
                        nd.nomineeRelation,
                                
                        -- Documents
                        doc.id AS documentsId,
                        doc.aadharCardFileKey,
                        doc.panCardFileKey,
                        doc.bankProofFileKey,
                        doc.salarySlipsFileKey,
                        doc.itrDocumentsFileKey
                                
                    FROM servicerequests sr
                    INNER JOIN users u ON sr.userId = u.id
                    LEFT JOIN investmentdetails inv ON inv.serviceRequestId = sr.id
                    LEFT JOIN basicdetails bd ON inv.basicDetailsId = bd.id
                    LEFT JOIN personaldetails pd ON inv.personalDetailsId = pd.id
                    LEFT JOIN nomineedetails nd ON inv.nomineeDetailsId = nd.id
                    LEFT JOIN documents doc ON inv.documentsId = doc.id
                    LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id;
                     `,
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
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
} from '../common/serviceTypeMessage';

@Injectable()
export class GetServiceTypeByServiceIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getServiceTypeByServiceId(serviceRequestId: number, userId: number): Promise<any> {
        try {
            const result = await this.dataSource.query(
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
                        pd.email AS personalEmail,
                        pd.mobile AS personalMobile,
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
                    LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                    WHERE sr.serviceId = ? AND sr.userId = ?;
                     `,
                [serviceRequestId, userId],
            );

            if (result.length === 0) {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }

            return {
                status: true,
                message: serviceTypeRetrievedSuccessfully,
                data: result,
            };
        } catch (error) {
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            };
        }
    }
}

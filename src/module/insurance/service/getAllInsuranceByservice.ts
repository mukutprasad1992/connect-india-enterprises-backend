import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    insuranceNotFound,
    insuranceRetrievalError,
    insuranceRetrievedSuccessfully
} from '../common/insuranceMessage';


@Injectable()
export class GetInsuranceByServiceIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getInsuranceByServiceId(serviceRequestId: number, userId: number): Promise<any> {
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
                        u.mobileNo,
                        u.email,

                        -- Insurance
                        inv.id AS insuranceId,
                        inv.status,
                        inv.activeSteps,
                        inv.submit,

                        -- Service SubType
                        sst.ledgerType AS serviceSubTypeName,

                        -- Basic Details
                        bd.id AS basicDetailsId,
                        bd.aadharNumber,
                        bd.panNumber,

                        -- Personal Details
                        pd.id AS personalDetailsId,
                        pd.placeOfBirth,
                        pd.motherName,
                        pd.heightCM,
                        pd.weightKG,
                        pd.smoker,
                        pd.alcohol,
                        pd.income,
                        pd.occupation,

                        -- Nominee Details
                        nd.id AS nomineeDetailsId,
                        nd.nomineeName,
                        nd.nomineeDOB,
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
                    LEFT JOIN insurancedetails inv ON inv.serviceRequestId = sr.id
                    LEFT JOIN insurancebasicdetails bd ON inv.basicDetailsId = bd.id
                    LEFT JOIN insurancepersonaldetails pd ON inv.personalDetailsId = pd.id
                    LEFT JOIN insurancenomineedetails nd ON inv.nomineeDetailsId = nd.id
                    LEFT JOIN insurancedocuments doc ON inv.documentsId = doc.id
                    LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                    WHERE sr.serviceId = ? AND sr.userId =?;
                     `,
                [serviceRequestId, userId],
            );

            if (result.length === 0) {
                return {
                    status: false,
                    message: insuranceNotFound,
                };
            }

            return {
                status: true,
                message: insuranceRetrievedSuccessfully,
                data: result,
            };
        } catch (error) {
            return {
                status: false,
                message: insuranceRetrievalError,
                error: error.message,
            };
        }
    }
}

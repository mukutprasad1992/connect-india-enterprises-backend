import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    insuranceNotFound,
    insuranceRetrievalError,
    insuranceRetrievedSuccessfully,
    getInsuranceServiceStartRetrieving,
    getInsuranceServiceNoInsuranceFound,
    getInsuranceServiceRetrievedSuccessfully,
    getInsuranceServiceUnexpectedError,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class GetInsuranceByServiceIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getInsuranceByServiceId(serviceRequestId: number, userId: number): Promise<any> {
        this.logger.doLog(
            `${getInsuranceServiceStartRetrieving} (serviceRequestId: ${serviceRequestId}, userId: ${userId})`,
            'info'
        );

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

                    -- Insurance Details
                    inv.id AS insuranceId,
                    inv.status,
                    inv.activeSteps,
                    inv.submit,
                    inv.createdAt AS insuranceCreatedAt,

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
                WHERE sr.serviceId = ? AND sr.userId = ?
                ORDER BY sr.id DESC;
                `,
                [serviceRequestId, userId],
            );

            if (!result || result.length === 0) {
                this.logger.doLog(
                    `${getInsuranceServiceNoInsuranceFound} (serviceRequestId: ${serviceRequestId}, userId: ${userId})`,
                    'warn'
                );
                return {
                    status: false,
                    message: insuranceNotFound,
                };
            }

            this.logger.doLog(
                `${getInsuranceServiceRetrievedSuccessfully} (serviceRequestId: ${serviceRequestId}, userId: ${userId})`,
                'success'
            );

            return {
                status: true,
                message: insuranceRetrievedSuccessfully,
                data: result,
            };
        } catch (error) {
            this.logger.doLog(
                `${getInsuranceServiceUnexpectedError} (serviceRequestId: ${serviceRequestId}, userId: ${userId}): ${error.message}`,
                'error'
            );

            return {
                status: false,
                message: insuranceRetrievalError,
                error: error.message,
            };
        }
    }
}

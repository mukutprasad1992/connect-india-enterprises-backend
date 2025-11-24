import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    fetchingServiceTypeForServiceRequestId,
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypeRetrievedSuccessfully,
    andUserId,
    noServiceTypeFoundForServiceRequestId,
    serviceTypeRetrievedSuccessfullyForServiceRequestId,
    errorRetrievingServiceType
} from '../common/serviceTypeMessage';
import { AppLogger } from '../../../utils/common/loggerService'
@Injectable()
export class GetServiceTypeByServiceIdService {
    constructor(private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getServiceTypeByServiceId(serviceRequestId: number, userId: number): Promise<any> {
        this.logger.doLog(`${fetchingServiceTypeForServiceRequestId}=${serviceRequestId} ${andUserId}=${userId}`, 'success');
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
                                
                        -- Service SubType
                        sst.ledgerType AS serviceSubTypeName,
                                
                        -- Basic Details
                        bd.id AS basicDetailsId,
                        bd.aadharNumber,
                        bd.panNumber,
                                
                        -- Personal Details
                        pd.id AS personalDetailsId,
                        pd.email,
                        pd.mobile,
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
                    LEFT JOIN investmentbasicdetails bd ON inv.basicDetailsId = bd.id
                    LEFT JOIN investmentpersonaldetails pd ON inv.personalDetailsId = pd.id
                    LEFT JOIN investmentnomineedetails nd ON inv.nomineeDetailsId = nd.id
                    LEFT JOIN investmentdocuments doc ON inv.documentsId = doc.id
                    LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                    WHERE sr.serviceId = ? AND sr.userId = ? ORDER BY id DESC;
                     `,
                [serviceRequestId, userId],
            );

            if (result.length === 0) {
                this.logger.doLog(`${noServiceTypeFoundForServiceRequestId}=${serviceRequestId} ${andUserId}=${userId}`, 'fail');
                return {
                    status: false,
                    message: serviceTypeNotFound,
                };
            }
            this.logger.doLog(`${serviceTypeRetrievedSuccessfullyForServiceRequestId}=${serviceRequestId}  ${andUserId}=${userId}`, 'success');
            return {
                status: true,
                message: serviceTypeRetrievedSuccessfully,
                data: result,
            };
        } catch (error) {
            this.logger.doLog(`${errorRetrievingServiceType} ${error.message}`, 'fail');
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            };
        }
    }
}

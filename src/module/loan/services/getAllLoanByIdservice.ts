import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    errorRetrievingLoanForServiceRequestId,
    fetchingLoanForServiceRequestId,
    loanNotFound,
    loanRetrievalError,
    loanRetrievedSuccessfully,
    loanRetrievedSuccessfullyForServiceRequestId,
    noLoanFoundForServiceRequestId,
} from '../common/loanMessage';

@Injectable()
export class GetloanByServiceIdService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly logger: AppLogger,
    ) { }

    async getLoanByServiceId(serviceRequestId: number, userId: number): Promise<any> {
        this.logger.doLog(`${fetchingLoanForServiceRequestId} ${serviceRequestId}, userId: ${userId}`, 'info');

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

                    -- loan
                    ld.id AS loanId,
                    ld.status,
                    ld.activeSteps,
                    ld.submit,

                    -- Service SubType
                    sst.ledgerType AS serviceSubTypeName,

                    -- Personal Details
                    pd.id AS personalDetailsId,
                    pd.panNumber,
                    pd.aadharNumber,
                    pd.motherName,
                    pd.maritalStatus,
                    pd.currentAddress,

                    -- contact details
                    cd.id AS contactdetailsId,
                    cd.yearsOfCity,
                    cd.alternateNo,
                    cd.landmark,

                    -- employment Details
                    ed.id AS employmentDetailsId,
                    ed.designation,
                    ed.companyExp,
                    ed.totalWorkExp,
                    ed.officeMobile,
                    ed.officeAddress,

                    -- reference details
                    rd.id AS referencedetailsId,
                    rd.ref1Name,
                    rd.ref1Mobile,
                    rd.ref1Address,
                    rd.ref2Name,
                    rd.ref2Mobile,
                    rd.ref2Address,

                    -- Documents
                    doc.id AS documentsId,
                    doc.aadharCardFileKey,
                    doc.panCardFileKey,
                    doc.bankStatementFileKey,
                    doc.salarySlipsFileKey,
                    doc.photoFileKey

                FROM servicerequests sr
                INNER JOIN users u ON sr.userId = u.id
                LEFT JOIN loandetails ld ON ld.serviceRequestId = sr.id
                LEFT JOIN loanpersonaldetails pd ON ld.personalDetailsId = pd.id
                LEFT JOIN loanemploymentdetails ed ON ld.employmentDetailsId = ed.id
                LEFT JOIN loancontactdetails cd ON ld.contactDetailsId = cd.id
                LEFT JOIN loanreferencedetails rd ON ld.referenceDetailsId = rd.id
                LEFT JOIN loandocuments doc ON ld.documentsId = doc.id
                LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
                WHERE sr.serviceId = ? AND sr.userId = ? 
                ORDER BY sr.id DESC;
                `,
                [serviceRequestId, userId],
            );

            if (result.length === 0) {
                this.logger.doLog(`${noLoanFoundForServiceRequestId} ${serviceRequestId}, userId: ${userId}`, 'warn');
                return { status: false, message: loanNotFound };
            }

            this.logger.doLog(`${loanRetrievedSuccessfullyForServiceRequestId} ${serviceRequestId}, userId: ${userId}`, 'success');
            return { status: true, message: loanRetrievedSuccessfully, data: result };
        } catch (error: any) {
            this.logger.doLog(`${errorRetrievingLoanForServiceRequestId} ${serviceRequestId}, userId: ${userId} - ${error.message}`, 'error');
            return { status: false, message: loanRetrievalError, error: error.message };
        }
    }
}

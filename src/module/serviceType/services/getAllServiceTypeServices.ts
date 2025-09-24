import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    serviceTypeNotFound,
    serviceTypeRetrievalError,
    serviceTypesRetrievedSuccessfully,
} from '../common/serviceTypeMessage';

@Injectable()
export class GetALLServiceTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async getAllServiceTypesData(userId: number): Promise<any> {
        try {
            const investmentData = await this.dataSource.query(`
        SELECT
          sr.id,
          sr.serviceId,
          sr.serviceSubTypeId,
          u.id AS userId,
          u.firstName,
          u.lastName,
          u.email AS userEmail,
          u.mobileNo,
          u.profileImageKey,
          inv.id AS investmentId,
          inv.status,
          inv.activeSteps,
          inv.submit,
          sst.ledgerType AS serviceSubTypeName,
          bd.id AS basicDetailsId,
          bd.aadharNumber,
          bd.panNumber,
          pd.id AS personalDetailsId,
          pd.email AS email,
          pd.mobile AS mobile,
          pd.placeOfBirth,
          pd.income,
          pd.occupation,
          nd.id AS nomineeDetailsId,
          nd.nomineeIdType,
          nd.nomineeId,
          nd.nomineeMobile,
          nd.nomineeRelation,
          doc.id AS documentsId,
          doc.aadharCardFileKey,
          doc.panCardFileKey,
          doc.bankProofFileKey,
          doc.salarySlipsFileKey,
          doc.itrDocumentsFileKey
        FROM servicerequests sr
        INNER JOIN users u ON sr.userId = u.id
        LEFT JOIN investmentdetails inv ON inv.serviceRequestId = sr.id
        LEFT JOIN investmentBasicdetails bd ON inv.basicDetailsId = bd.id
        LEFT JOIN investmentpersonaldetails pd ON inv.personalDetailsId = pd.id
        LEFT JOIN investmentnomineedetails nd ON inv.nomineeDetailsId = nd.id
        LEFT JOIN investmentDocuments doc ON inv.documentsId = doc.id
        LEFT JOIN servicesubtypes sst ON sr.serviceSubTypeId = sst.id
        WHERE sr.serviceId = 1;
      `);

            // ---------------- Insurance Service (serviceId = 3) ----------------
            const insuranceData = await this.dataSource.query(`
        SELECT
          sr.id,
          sr.serviceId,
          sr.serviceSubTypeId,
          u.id AS userId,
          u.firstName,
          u.lastName,
          u.mobileNo,
          u.email,
          u.profileImageKey,
          inv.id AS insuranceId,
          inv.status,
          inv.activeSteps,
          inv.submit,
          sst.ledgerType AS serviceSubTypeName,
          bd.id AS basicDetailsId,
          bd.aadharNumber,
          bd.panNumber,
          pd.id AS personalDetailsId,
          pd.placeOfBirth,
          pd.motherName,
          pd.heightCM,
          pd.weightKG,
          pd.smoker,
          pd.alcohol,
          pd.income,
          pd.occupation,
          nd.id AS nomineeDetailsId,
          nd.nomineeName,
          nd.nomineeDOB,
          nd.nomineeRelation,
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
        WHERE sr.serviceId = 3;
      `);

            // ---------------- Loan Service (serviceId = 4) ----------------
            const loanData = await this.dataSource.query(`
        SELECT
          sr.id,
          sr.serviceId,
          sr.serviceSubTypeId,
          u.id AS userId,
          u.firstName,
          u.lastName,
          u.mobileNo,
          u.email,
          u.profileImageKey,
          ld.id AS loanId,
          ld.status,
          ld.activeSteps,
          ld.submit,
          sst.ledgerType AS serviceSubTypeName,
          pd.id AS personalDetailsId,
          pd.panNumber,
          pd.aadharNumber,
          pd.motherName,
          pd.maritalStatus,
          pd.currentAddress,
          cd.id AS contactdetailsId,
          cd.yearsOfCity,
          cd.alternateNo,
          cd.landmark,
          ed.id AS employmentDetailsId,
          ed.designation,
          ed.companyExp,
          ed.totalWorkExp,
          ed.officeMobile,
          ed.officeAddress,
          rd.id AS referencedetailsId,
          rd.ref1Name,
          rd.ref1Mobile,
          rd.ref1Address,
          rd.ref2Name,
          rd.ref2Mobile,
          rd.ref2Address,
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
        WHERE sr.serviceId = 4;
      `);

            const allData = [...investmentData, ...insuranceData, ...loanData];

            if (allData.length > 0) {
                return {
                    status: true,
                    message: serviceTypesRetrievedSuccessfully,
                    data: allData,
                };
            } else {
                return {
                    status: false,
                    message: serviceTypeNotFound,
                    data: null,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            };
        }
    }
}

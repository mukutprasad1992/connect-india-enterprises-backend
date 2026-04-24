import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CeateVoucherDTO } from '../voucherDTO/createVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { DataSource, Repository } from 'typeorm';
import { VoucherMailService } from '../../../utils/mailer/voucherMail';
import * as fs from 'fs';
import * as path from 'path';
import { UploadCouponPDFService } from '../../file/service/uploadCouponPDfService';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { SuccessVoucherMessageService } from '../common/template/voucherNotificationSuccessMessageTemplate';
import {
  alreadyExistsAbortingCreation,
  anErrorOccurredWhileCreatingTheVoucher,
  aNewCouponHasJustBeenGenerated,
  checkingIfVoucherCodeAlreadyExists,
  creatingNotificationForVendor,
  emailSendingFailedForOneOrBothRecipients,
  errorWhileCreatingVoucherByUserID,
  failedToSavePDFURLInDatabase,
  failedToSendEmails,
  failedToUpdatePDFURLForVoucherID,
  failedToUpdateThePDFURLInTheDatabase,
  failedToUploadPDF,
  fetchingFullVoucherDetails,
  fileNotUpload,
  insertingVoucherForVendorID,
  notificationCreatedForVendorID,
  PDFGeneratedAt,
  PDFUploadedSuccessfullyURL,
  PDFURLUpdatedSuccessfullyForVoucherID,
  savingPDFURLForVoucherID,
  sendingVoucherCreationEmailsToVendorAndCustomer,
  updatingVoucherRecordWithUploadedPDFURL,
  uploadingPDFToCloudStorage,
  voucherCodeIsAlreadyExist,
  voucherCreatedSuccessfully,
  voucherCreatedSuccessfullyByUserID,
  voucherCreationFailedForUserID,
  voucherCreationInitiatedByUserID,
  voucherDetailsFetchedForVoucherID,
  voucherInsertedSuccessfullyNewVoucherID,
} from '../common/voucherMessage';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class CreateVoucherService {
  constructor(
    @InjectRepository(VoucherSchema)
    private userRepository: Repository<VoucherSchema>,
    private dataSource: DataSource,
    private VoucherMailService: VoucherMailService,
    private readonly createNotificationService: CreateNotificationService,
    private readonly successVoucherMessageService: SuccessVoucherMessageService,
    private uploadCouponPDFService: UploadCouponPDFService,
    private readonly logger: AppLogger,
  ) {}

  async isVoucherCode(voucherCode: string): Promise<boolean> {
    this.logger.doLog(
      `${checkingIfVoucherCodeAlreadyExists} ${voucherCode}`,
      'info',
    );
    const result = await this.dataSource.query(
      'SELECT voucherCode FROM vouchers WHERE voucherCode = ? LIMIT 1',
      [voucherCode],
    );
    this.logger.doLog(
      `Voucher code ${voucherCode} ${result.length > 0 ? 'already exists' : 'is available'}`,
      'info',
    );
    return result.length > 0;
  }

  async createVoucher(
    userId: number,
    ceateVoucherDTO: CeateVoucherDTO,
  ): Promise<any> {
    this.logger.doLog(`${voucherCreationInitiatedByUserID} ${userId}`, 'info');

    const voucherCodeExists = await this.isVoucherCode(
      ceateVoucherDTO.voucherCode,
    );
    if (voucherCodeExists) {
      this.logger.doLog(
        `Voucher code ${ceateVoucherDTO.voucherCode} ${alreadyExistsAbortingCreation}`,
        'warn',
      );
      return {
        status: false,
        message: voucherCodeIsAlreadyExist,
        data: null,
      };
    }

    const createdBy = userId;
    const values = [
      ceateVoucherDTO.amount,
      ceateVoucherDTO.voucherCode,
      ceateVoucherDTO.validityFrom,
      ceateVoucherDTO.validityTo,
      ceateVoucherDTO.vendorId,
      ceateVoucherDTO.customerId,
      ceateVoucherDTO.status,
      createdBy,
    ];

    const query = `INSERT INTO vouchers ( amount, voucherCode, validityFrom, validityTo, vendorId, customerId, status, createdBy, createdAt)
                       VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, now())`;

    try {
      this.logger.doLog(
        `${insertingVoucherForVendorID} ${ceateVoucherDTO.vendorId}`,
        'info',
      );
      const result = await this.dataSource.query(query, values);
      const voucherId = result.insertId;
      this.logger.doLog(
        `${voucherInsertedSuccessfullyNewVoucherID} ${voucherId}`,
        'success',
      );

      this.logger.doLog(fetchingFullVoucherDetails, 'info');
      const createdVoucher = await this.dataSource.query(
        `SELECT
                    v.id, v.amount, v.voucherCode, v.validityFrom, v.validityTo, v.customerId, v.vendorId,
                    c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone, c.email AS customerEmail,
                    c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo, u.businessName AS vendorBusinessName,
                    u.businessRepresentative AS vendorBusinessRepresentative, u.pinCode AS vendorPincode, u.vendorCode AS vendorCode, u.address AS vendorAddress, u.profileImageURL AS imageUrl,
                    v.createdAt AS CreatedAt, v.status AS status, v.pdfURL AS pdfURL, v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt, v.updatedBy AS UpdatedBy
                 FROM
                    vouchers v
                 LEFT JOIN
                    customers c ON v.customerId = c.id
                 LEFT JOIN
                    users u ON v.vendorId = u.id
                 WHERE
                    v.id = ?;`,
        [voucherId],
      );

      const voucherDetails = createdVoucher[0];
      this.logger.doLog(
        `${voucherDetailsFetchedForVoucherID} ${voucherId}`,
        'info',
      );

      this.logger.doLog(
        sendingVoucherCreationEmailsToVendorAndCustomer,
        'info',
      );
      const sendEmailToVendor =
        await this.VoucherMailService.sendVoucherEmailToVendorCreated(
          voucherDetails,
        );
      const sendEmailCustomer =
        await this.VoucherMailService.sendVoucherEmailToCustomerCreated(
          voucherDetails,
        );

      const pdfPath = sendEmailCustomer.data.pdfPath;
      this.logger.doLog(`${PDFGeneratedAt} ${pdfPath}`, 'info');
      const pdfBuffer = fs.readFileSync(pdfPath);
      const originalName = path.basename(pdfPath);

      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: originalName,
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        destination: '',
        filename: originalName,
        path: pdfPath,
        stream: null,
      };

      this.logger.doLog(uploadingPDFToCloudStorage, 'info');
      const uploadResult =
        await this.uploadCouponPDFService.uploadFile(mockFile);
      const URL = uploadResult.data.url;
      this.logger.doLog(`${PDFUploadedSuccessfullyURL} ${URL}`, 'success');

      if (!uploadResult) {
        this.logger.doLog(failedToUploadPDF, 'error');
        return { status: false, message: fileNotUpload };
      }

      this.logger.doLog(updatingVoucherRecordWithUploadedPDFURL, 'info');
      const saveUrl = await this.saveVoucerPDFFile(URL, voucherId);
      if (saveUrl === false) {
        this.logger.doLog(failedToSavePDFURLInDatabase, 'error');
        return { staus: false, message: failedToUpdateThePDFURLInTheDatabase };
      }

      if (!sendEmailCustomer || !sendEmailToVendor) {
        this.logger.doLog(emailSendingFailedForOneOrBothRecipients, 'error');
        return { status: false, message: failedToSendEmails };
      }

      this.logger.doLog(creatingNotificationForVendor, 'info');
      const notificationPayload: CreateNotificationDTO = {
        message: `🎉 Hey ${voucherDetails.vendorName} 🎉<br/>${aNewCouponHasJustBeenGenerated}`,
        userRoleId: 1,
        voucherId: voucherDetails.id,
        isRead: false,
        userId: userId,
        vendorId: ceateVoucherDTO.vendorId,
        createdBy: userId,
        isUser: 0,
      };

      await this.createNotificationService.createNotification(
        notificationPayload,
      );
      this.logger.doLog(
        `${notificationCreatedForVendorID} ${ceateVoucherDTO.vendorId}`,
        'success',
      );

      if (createdVoucher.length > 0) {
        this.logger.doLog(
          `${voucherCreatedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return {
          status: true,
          message: voucherCreatedSuccessfully,
          data: voucherDetails,
        };
      } else {
        this.logger.doLog(
          `${voucherCreationFailedForUserID} ${userId}`,
          'warn',
        );
        return {
          status: false,
          message: anErrorOccurredWhileCreatingTheVoucher,
          data: null,
        };
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileCreatingVoucherByUserID} ${userId}, error: ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileCreatingTheVoucher,
        error: error.message,
      };
    }
  }

  async saveVoucerPDFFile(pdfURL: string, voucherId: number): Promise<any> {
    this.logger.doLog(`${savingPDFURLForVoucherID} ${voucherId}`, 'info');
    const id = voucherId;
    const query = `UPDATE vouchers SET pdfURL = ? WHERE id = ?;`;

    const result = await this.dataSource.query(query, [pdfURL, id]);
    if (!result) {
      this.logger.doLog(
        `${failedToUpdatePDFURLForVoucherID} ${voucherId}`,
        'error',
      );
      return { status: false, message: failedToUpdateThePDFURLInTheDatabase };
    } else {
      this.logger.doLog(
        `${PDFURLUpdatedSuccessfullyForVoucherID} ${voucherId}`,
        'success',
      );
      return { data: result };
    }
  }
}

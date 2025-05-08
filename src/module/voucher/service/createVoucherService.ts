import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CeateVoucherDTO } from '../voucherDTO/createVoucherDTO';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { DataSource, Repository } from "typeorm";
import { VoucherMailService } from '../../../utils/mailer/voucherMail';
import { CreateNotificationDTO } from 'src/module/notificaton/notificationDTO/createNotificationDTO';
import { SuccessVoucherMessageService } from '../common/template/voucherNotificationSuccessMessageTemplate'
import {
    anErrorOccurredWhileCreatingTheVoucher,
    aNewcouponhasJustBeenGeneratedFor,
    greatNews,
    notificationCreationFailed,
    theyCanRedeemitAtYourStoreSoGetReadyToWelcomeThemWithASmile,
    voucherCodeIsAlreadyExist,
    voucherCreatedSuccessfully
} from '../common/voucherMessage';
import { CreateNotificationService } from '../../notificaton/service/createNotificationService';

@Injectable()
export class CreateVoucherService {
    constructor(
        @InjectRepository(VoucherSchema) private userRepository: Repository<VoucherSchema>,
        private dataSource: DataSource,
        private VoucherMailService: VoucherMailService,
        private readonly createNotificationService: CreateNotificationService,
        private readonly successVoucherMessageService: SuccessVoucherMessageService,
    ) { }

    async isVoucherCode(voucherCode: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT voucherCode FROM vouchers WHERE voucherCode = ? LIMIT 1',
            [voucherCode]
        );
        return result.length > 0;
    }

    async createVoucher(userId: number, ceateVoucherDTO: CeateVoucherDTO): Promise<any> {
        const voucherCodeExists = await this.isVoucherCode(ceateVoucherDTO.voucherCode);
        if (voucherCodeExists) {
            return {
                status: false,
                message: voucherCodeIsAlreadyExist,
                data: null
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
            createdBy
        ];

        const query = `INSERT INTO vouchers ( amount, voucherCode, validityFrom, validityTo, vendorId, customerId, status, createdBy, createdAt)
                       VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, now())`;

        try {
            const result = await this.dataSource.query(query, values);
            const voucherId = result.insertId;

            const createdVoucher = await this.dataSource.query(
                `SELECT
                    v.id, v.amount, v.voucherCode, v.validityFrom, v.validityTo, v.customerId, v.vendorId,
                    c.name AS customerName, c.address AS customerAddress, c.phone AS customerPhone, c.email AS customerEmail,
                    c.pincode AS customerPincode, u.email AS vendorEmail, u.mobileNo AS vendorMobileNo, u.businessName AS vendorBusinessName,
                    u.businessRepresentative AS vendorBusinessRepresentative, u.vendorCode AS vendorCode, u.address AS vendorAddress,
                    v.createdAt AS CreatedAt, v.status AS status, v.createdBy AS CreatedBy, v.updatedAt AS UpdatedAt, v.updatedBy AS UpdatedBy
                 FROM
                    vouchers v
                 LEFT JOIN
                    customers c ON v.customerId = c.id
                 LEFT JOIN
                    users u ON v.vendorId = u.id
                 WHERE
                    v.id = ?;`,
                [voucherId]
            );

            const voucherDetails = createdVoucher[0];

            const sendEmailToVendor = await this.VoucherMailService.sendVoucherEmailToVendorCreated(voucherDetails);
            const sendEmailCustomer = await this.VoucherMailService.sendVoucherEmailToCustomerCreated(voucherDetails);

            if (!sendEmailCustomer || !sendEmailToVendor) {
                return {
                    status: false,
                    message: "Failed to send emails."
                };
            }
            const htmlMessage = await this.successVoucherMessageService.getCouponGeneratedMessage(voucherDetails);
            const notificationPayload: CreateNotificationDTO = {
                message: `${htmlMessage}`,
                userRoleId: 1,
                voucherId: voucherDetails.id,
                isRead: false,
                userId: userId,
                vendorId: ceateVoucherDTO.vendorId,
                createdBy: userId,
                isUser: 0
            };

            await this.createNotificationService.createNotification(notificationPayload);

            if (createdVoucher.length > 0) {
                return {
                    status: true,
                    message: voucherCreatedSuccessfully,
                    data: voucherDetails,
                };
            } else {
                return {
                    status: false,
                    message: anErrorOccurredWhileCreatingTheVoucher,
                    data: null
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileCreatingTheVoucher,
                error: error.message
            };
        }
    }
}

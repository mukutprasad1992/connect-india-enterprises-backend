import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { blockedSubjects, mailSentSuccessfully, unblockedSubjects } from '../common/common';
import { emailVendorStatusTemplate } from '../template/VendorBlockOrUblockEmailTemplate';
@Injectable()
export class VendorBlockOrUnblockMailService {
    private transporter;
    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async emailVendorBlockOrUnblock(to: string, status: string, businessName: string) {
        const subjects = status === 'Enable' ? unblockedSubjects : blockedSubjects;
        const tempalte = emailVendorStatusTemplate.VendorStatus(status, businessName);
        try {
            const USER_EMAIL = process.env.USER_EMAIL;
            const mailOptions = {
                from: USER_EMAIL,
                to,
                subject: `${subjects}`,
                html: tempalte,
            };

            const mail = await this.transporter.sendMail(mailOptions);

            return {
                status: true,
                message: mailSentSuccessfully,
                data: mail,
            };
        } catch (error) {
            return {
                status: false,
                error: error.message,
            };
        }
    }
}

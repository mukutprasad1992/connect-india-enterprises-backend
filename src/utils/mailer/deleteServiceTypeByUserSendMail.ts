import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { emailDeleteServiceTypeTemplates } from '../template/deleteServiceTypeByUserMailTemplate';
import {
  notificationSentSuccessfully,
  serviceRequestHasBeenDeleted,
} from '../common/common';

@Injectable()
export class DeleteServiceTypeByUserSendMailService {
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

  async deleteSirviceTypeSendEmail(to: string, serviceSubType: string) {
    try {
      const USER_EMAIL = process.env.USER_EMAIL;

      const htmlTemplate =
        emailDeleteServiceTypeTemplates.ServiceTypeDeleted(serviceSubType);
      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject: `Your ${serviceSubType} ${serviceRequestHasBeenDeleted}`,
        html: htmlTemplate,
      };

      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: notificationSentSuccessfully,
        data: mail,
      };
    } catch (error: any) {
      return {
        status: false,
        error: error.message,
      };
    }
  }
}

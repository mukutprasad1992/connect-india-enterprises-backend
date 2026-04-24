import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { emailTemplates } from '../template/notifiacatiomServiceStatusTemplate';
import { notificationSentSuccessfully, serviceStatus } from '../common/common';

@Injectable()
export class NotificationMailService {
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

  async sendNotificationEmail(
    to: string,
    status: string,
    serviceSubType: string,
  ) {
    try {
      const USER_EMAIL = process.env.USER_EMAIL;

      const htmlTemplate = emailTemplates[status]?.(serviceSubType);

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject: serviceStatus,
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

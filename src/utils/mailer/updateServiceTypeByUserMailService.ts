import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  mailSentSuccessfully,
  yourServiceRequestUpdatedSuccessfully,
} from '../common/common';
import { emailUpdateServiceTypeTemplates } from '../template/updateServiceTypeByUserMailTemplate';

@Injectable()
export class UpdateServiceTypeByUserMailService {
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

  async emailCreateServiceTypeTemplates(to: string, serviceSubType: string) {
    try {
      const USER_EMAIL = process.env.USER_EMAIL;

      const htmlTemplate =
        emailUpdateServiceTypeTemplates.UpdateUserRequest(serviceSubType);
      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject: yourServiceRequestUpdatedSuccessfully,
        html: htmlTemplate,
      };

      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: mailSentSuccessfully,
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

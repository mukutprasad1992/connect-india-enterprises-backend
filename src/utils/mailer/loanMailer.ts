import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { emailCreateServiceTypeTemplates } from '../template/createServiceTypeEmailtemplate';
import {
  mailSentSuccessfully,
  yourServiceRequestCreatedSuccessfully,
} from '../common/common';

@Injectable()
export class LoanMailService {
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

  async emailCreateLoanTemplates(
    to: string,
    firstName: string,
    lastName: string,
    status: string,
    serviceSubType: string,
  ) {
    try {
      const USER_EMAIL = process.env.USER_EMAIL;

      const htmlTemplate = emailCreateServiceTypeTemplates.NewUserRequest(
        firstName,
        lastName,
        serviceSubType,
      );
      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject: yourServiceRequestCreatedSuccessfully,
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

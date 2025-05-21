import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  passwordResetRequest,
  pleaseClickTheFollowingLinkToResetYourPassword,
  resetPassword,
  passwordResetEmailSentSuccessfully,
} from '../../module/auth/common/authMessage';
import {
  welcomeEmailForNormailUser,
  welcomeEmailSubject,
} from '../template/welcomeEmailForNormalUser';
import {
  collaboratorEmailSentSucessfully,
  welcomeEmailSentSucessfully,
} from '../common/common';
import {
  collaboratorUserEmailSubject,
  getCollaboratorUserCreatedEmailMessage,
} from '../template/accountCreationEmailForCollaborator';

@Injectable()
export class MailService {
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
  async sendPasswordResetEmail(to: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/authentication/resetPassword?token=${token}`;
      const USER_EMAIL = process.env.USER_EMAIL;
      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject: passwordResetRequest,
        html: `<p>${pleaseClickTheFollowingLinkToResetYourPassword} <a href="${resetUrl}"> ${resetPassword}</a></p>`,
      };
      const mail = await this.transporter.sendMail(mailOptions);
      return {
        status: true,
        message: passwordResetEmailSentSuccessfully,
        data: mail,
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
      };
    }
  }
  async sendEmailVendorUserCreated(to: string, Password: string, businessRepresentative: any) {
    try {
      const userId = to;
      const USER_EMAIL = process.env.USER_EMAIL;
      const subject = collaboratorUserEmailSubject;
      const message = await getCollaboratorUserCreatedEmailMessage(
        userId,
        Password,
        businessRepresentative
      );

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html: message,
      };
      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: collaboratorEmailSentSucessfully,
        data: mail,
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
      };
    }
  }

  async sendWelcomeEmailToNewUserCreated(to: string) {
    try {
      const USER_EMAIL = process.env.USER_EMAIL;
      const subject = welcomeEmailSubject;
      const template = welcomeEmailForNormailUser;

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html: template,
      };

      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: welcomeEmailSentSucessfully,
        data: mail,
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
      };
    }
  }
  async sendVoucherEmailToVenderCreated(createdVoucher) {
    try {
      const to = createdVoucher.email
      const USER_EMAIL = process.env.USER_EMAIL;
      const subject = welcomeEmailSubject;
      const template = welcomeEmailForNormailUser;

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html: template,
      };

      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: welcomeEmailSentSucessfully,
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

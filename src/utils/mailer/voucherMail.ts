import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  welcomeEmailSubject,
} from '../template/welcomeEmailForNormalUser';
import {
  connectIndiaEnterprises,
  errorGeneratingPDF,
  hereIsYourVoucherTicketDetails,
  ishereForYou,
  logoImageNotFound,
  needHelp,
  signatureOfAuthority,
  thankYouForChoosing,
  thisVoucherCanBeUsedForOnly,
  welcomeEmailSentSucessfully,
  withinTheValidityPeriod,
} from '../common/common';
// import * as QRCode from 'qrcode';
import { UploadCouponPDFService } from '../../module/file/service/uploadCouponPDfService';
import { sendEmailToVendorForVoucherCreated } from '../template/voucherCreatedSuccessfullyToVendor';
import { sendEmailToCustomerForVoucherCreated } from '../template/voucherCreatedSuccessfullyToCustomer';
import { PDFDocument, rgb, StandardFonts, degrees, PDFPage, PDFFont } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VoucherMailService {
  private transporter;

  constructor(
    private configService: ConfigService,
    private uploadCouponPDFService: UploadCouponPDFService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendVoucherEmailToVendorCreated(voucherDetails) {
    try {
      const pdfPath = await this.generateVoucherPdf(voucherDetails);
      const to = voucherDetails.vendorEmail;
      const USER_EMAIL = process.env.USER_EMAIL;
      const subject = welcomeEmailSubject;
      const template = await sendEmailToVendorForVoucherCreated(voucherDetails);

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html: template,
        attachments: [
          {
            filename: path.basename(pdfPath),
            path: pdfPath,
          },
        ],
      };
      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: welcomeEmailSentSucessfully,
        data: {
          mail,
          pdfPath
        },
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
      };
    }
  }

  async sendVoucherEmailToCustomerCreated(voucherDetails) {
    try {
      const pdfPath = await this.generateVoucherPdf(voucherDetails);

      const to = voucherDetails.customerEmail;

      const USER_EMAIL = process.env.USER_EMAIL;
      const subject = welcomeEmailSubject;
      const template = await sendEmailToCustomerForVoucherCreated(voucherDetails);

      const mailOptions = {
        from: USER_EMAIL,
        to,
        subject,
        html: template,
        attachments: [
          {
            filename: path.basename(pdfPath),
            path: pdfPath,
          },
        ],
      };

      const mail = await this.transporter.sendMail(mailOptions);

      return {
        status: true,
        message: welcomeEmailSentSucessfully,
        data: {
          mail,
          pdfPath
        },
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
      };
    }
  }

  async generateVoucherPdf(voucherData: any): Promise<string> {
    try {

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { width, height, } = page.getSize();
      const currentDate = new Date().toLocaleDateString();

      const pdfName = `ConnectIndiaVoucher${voucherData.voucherCode}`;
      const outputDir = path.join(__dirname, 'output', voucherData.voucherCode);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const logoImagePath = path.resolve(__dirname, '..', '..', 'logo-transparent-png.png');
      if (!fs.existsSync(logoImagePath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoBytes = fs.readFileSync(logoImagePath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, { x: 50, y: height - 85, width: 170, height: 55 });

      //rupees icon 
      const logoRupees = path.resolve(__dirname, '..', '..', 'iconsrupee.png');

      if (!fs.existsSync(logoRupees)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoRupeesBytes = fs.readFileSync(logoRupees);
      const logoRupeesImage = await pdfDoc.embedPng(logoRupeesBytes);
      page.drawImage(logoRupeesImage, { x: 85, y: height - 211, width: 8, height: 8 });

      // contact icon 
      const logoContact = path.resolve(__dirname, '..', '..', 'iconscontact.png');

      if (!fs.existsSync(logoRupees)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoContactBytes = fs.readFileSync(logoContact);
      const logoContactImage = await pdfDoc.embedPng(logoContactBytes);

      // address icon 
      const logoAddressPath = path.resolve(__dirname, '..', '..', 'iconsaddress.png');
      if (!fs.existsSync(logoImagePath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoAddressBytes = fs.readFileSync(logoAddressPath);
      const logoAddressImage = await pdfDoc.embedPng(logoAddressBytes);
      // phone icon 
      const logoPhonePath = path.resolve(__dirname, '..', '..', 'iconsphone.png');
      if (!fs.existsSync(logoImagePath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoPhoneBytes = fs.readFileSync(logoPhonePath);
      const logoPhoneImage = await pdfDoc.embedPng(logoPhoneBytes);

      // email icon 
      const logoEmailPath = path.resolve(__dirname, '..', '..', 'iconsemail.png');
      if (!fs.existsSync(logoImagePath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoEmailBytes = fs.readFileSync(logoEmailPath);
      const logoEmailImage = await pdfDoc.embedPng(logoEmailBytes);
      // pincode icon
      const logoPinCodePath = path.resolve(__dirname, '..', '..', 'iconspincode.png');
      if (!fs.existsSync(logoImagePath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoPinCodeBytes = fs.readFileSync(logoPinCodePath);
      const logoPinCodeImage = await pdfDoc.embedPng(logoPinCodeBytes);
      // Support icon
      const logoSupportPath = path.resolve(__dirname, '..', '..', 'iconsonlinesupport.png');
      if (!fs.existsSync(logoSupportPath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoSupportBytes = fs.readFileSync(logoSupportPath);
      const logoSupportImage = await pdfDoc.embedPng(logoSupportBytes);

      // Quick Resolution icon 
      const logoResolutionPath = path.resolve(__dirname, '..', '..', 'iconsclock.png');
      if (!fs.existsSync(logoResolutionPath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoResolutionBytes = fs.readFileSync(logoResolutionPath);
      const logoResolutionImage = await pdfDoc.embedPng(logoResolutionBytes);
      // 
      const logoMultilingualPath = path.resolve(__dirname, '..', '..', 'iconscallmessage.png');
      if (!fs.existsSync(logoMultilingualPath)) {
        console.error(logoImageNotFound);
        return null;
      }
      const logoMultilingualBytes = fs.readFileSync(logoMultilingualPath);
      const logoMultilingualImage = await pdfDoc.embedPng(logoMultilingualBytes);
      // Fonts
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 8;

      // Colors
      const primaryColor = rgb(0.7, 0, 0); // Dark Red
      const brownColor = rgb(165 / 255, 42 / 255, 42 / 255);
      const blackColor = rgb(0, 0, 0);

      function getTextWidth(text, font, fontSize) {
        return font.widthOfTextAtSize(text, fontSize);
      }

      const title = 'Voucher Ticket';
      const vendorName = voucherData.vendorBusinessName;

      const titleWidth = getTextWidth(title, font, fontSize);
      const vendorNameWidth = getTextWidth(vendorName, font, fontSize);
      const titleX = ((width - titleWidth) / 2) - 12;
      const vendorNameX = (width - vendorNameWidth) / 2;

      page.drawText(title, { x: titleX, y: height - 50, size: 14, font, color: brownColor });
      page.drawText(vendorName, { x: vendorNameX, y: height - 70, size: 10, font, color: brownColor });

      page.drawLine({
        start: { x: 50, y: height - 105 },
        end: { x: 550, y: height - 105 },
        color: rgb(116 / 255, 127 / 255, 141 / 255),
        thickness: 1,
      });
      page.drawText(`Voucher Number: ${voucherData.voucherCode} |`, { x: 138, y: height - 120, size: fontSize, font: fontRegular, color: brownColor });
      page.drawText(`Vendor Code: ${voucherData.vendorCode} |`, { x: 270, y: height - 120, size: fontSize, font: fontRegular, color: brownColor });
      page.drawText(`Date: ${currentDate}`, { x: 400, y: height - 120, size: fontSize, font: fontRegular, color: brownColor });

      page.drawText(`Hey ${voucherData.customerName}`, { x: 50, y: height - 150, size: 9, font: fontRegular, color: blackColor });

      const regularText = thankYouForChoosing;
      const boldText = connectIndiaEnterprises;
      const remainingText = hereIsYourVoucherTicketDetails;
      const regularTextWidth = fontRegular.widthOfTextAtSize(regularText, 9);
      const boldTextWidth = font.widthOfTextAtSize(boldText, 9);
      const remainingTextWidth = fontRegular.widthOfTextAtSize(remainingText, 9);


      const startX = 50;
      const startY = height - 180;

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
      };
      // Draw the text
      page.drawText(regularText, { x: startX, y: startY, size: 9, font: fontRegular, color: blackColor });
      page.drawText(boldText, { x: startX + regularTextWidth, y: startY, size: 9, font: font, color: blackColor });
      page.drawText(remainingText, { x: startX + regularTextWidth + boldTextWidth, y: startY, size: 9, font: fontRegular, color: blackColor });

      page.drawText(`Amount:`, { x: 50, y: height - 210, size: 9, font: fontRegular, color: blackColor });
      page.drawText(`${voucherData.amount}/-`, { x: 94, y: height - 210, size: 9, font, color: rgb(0, 0.5, 0) });
      page.drawText(`Validity From: ${formatDate(voucherData.validityFrom)}`, {
        x: 50, y: height - 240, size: 9, font: fontRegular, color: blackColor
      });
      page.drawText(`Validity To: ${formatDate(voucherData.validityTo)}`, {
        x: 50, y: height - 260, size: 9, font: fontRegular, color: blackColor
      });

      const regularVoucherText = thisVoucherCanBeUsedForOnly;
      const boldVoucherText = `${voucherData.vendorBusinessName}`;
      const remainingVoucherText = withinTheValidityPeriod;
      const regularVoucherTextWidth = fontRegular.widthOfTextAtSize(regularVoucherText, 9);
      const boldVoucherTextWidth = font.widthOfTextAtSize(boldVoucherText, 9);
      const remainingVoucherTextWidth = fontRegular.widthOfTextAtSize(remainingVoucherText, 9);

      const startVoucherX = 50;
      const startVoucherY = height - 290;

      page.drawText(regularVoucherText, { x: startVoucherX, y: startVoucherY, size: 9, font: fontRegular, color: blackColor });
      page.drawText(boldVoucherText, { x: startVoucherX + regularVoucherTextWidth, y: startVoucherY, size: 9, font: font, color: rgb(0, 0.5, 0) });
      page.drawText(remainingVoucherText, { x: startVoucherX + regularVoucherTextWidth + boldVoucherTextWidth + 1, y: startVoucherY, size: 9, font: fontRegular, color: blackColor });

      page.drawRectangle({
        x: 90,
        y: height - 580,
        width: 410,
        height: 270,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(116 / 255, 127 / 255, 141 / 255)

      });
      page.drawRectangle({
        x: 90,
        y: height - 330,
        width: 410,
        height: 20,
        color: brownColor,
        borderWidth: 0,
      });

      page.drawText('Vendor Details', {
        x: 100,
        y: height - 325,
        size: 11,
        font: fontRegular,
        color: rgb(1, 1, 1)
      });

      page.drawText(`Name:`, { x: 115, y: height - 350, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawImage(logoContactImage, { x: 116, y: height - 367, width: 9, height: 9 });
      page.drawText(`${voucherData.vendorBusinessName}`, { x: 135, y: height - 365, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Email:`, { x: 330, y: height - 350, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawImage(logoEmailImage, { x: 333, y: height - 367, width: 12, height: 12 });
      page.drawText(`${voucherData.vendorEmail}`, { x: 350, y: height - 365, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Phone:`, { x: 115, y: height - 380, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawImage(logoPhoneImage, { x: 117, y: height - 397, width: 11, height: 11 });
      page.drawText(`${voucherData.vendorMobileNo}`, { x: 135, y: height - 395, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Address:`, { x: 330, y: height - 380, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawImage(logoAddressImage, { x: 333, y: height - 397, width: 11, height: 11 });
      const maxLineLength = 30;
      let address = voucherData.vendorAddress.trim().replace(/\s+/g, " ");
      let firstLine = address.substring(0, maxLineLength);
      let secondLine = address.substring(maxLineLength, maxLineLength * 2);
      let thirdLine = address.substring(maxLineLength * 2, maxLineLength * 3);
      page.drawText(firstLine, {
        x: 350,
        y: height - 395,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      page.drawText(secondLine, {
        x: 350,
        y: height - 395 - 9.5,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      page.drawText(thirdLine, {
        x: 350,
        y: height - 395 - 19,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Pin code:`, { x: 115, y: height - 410, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawImage(logoPinCodeImage, { x: 117, y: height - 427, width: 11, height: 11 });
      page.drawText(`${voucherData.vendorPincode}`, { x: 135, y: height - 425, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawImage(logoContactImage, { x: 116, y: height - 497, width: 9, height: 9 });
      page.drawImage(logoEmailImage, { x: 333, y: height - 497, width: 12, height: 12 });
      page.drawImage(logoPhoneImage, { x: 117, y: height - 527, width: 11, height: 11 });
      page.drawImage(logoAddressImage, { x: 333, y: height - 527, width: 11, height: 11 });
      page.drawImage(logoPinCodeImage, { x: 117, y: height - 557, width: 11, height: 11 });
      page.drawRectangle({
        x: 90,
        y: height - 460,
        width: 410,
        height: 20,
        color: brownColor,
        borderWidth: 0,
      });

      page.drawText('Customer Details', {
        x: 100,
        y: height - 455,
        size: 11,
        font: fontRegular,
        color: rgb(255 / 255, 255 / 255, 255 / 255)
      });

      page.drawText(`Name:`, { x: 115, y: height - 480, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });

      page.drawText(`${voucherData.customerName}`, { x: 135, y: height - 495, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Email:`, { x: 330, y: height - 480, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });

      page.drawText(`${voucherData.customerEmail}`, { x: 350, y: height - 495, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Phone:`, { x: 115, y: height - 510, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });

      page.drawText(`${voucherData.customerPhone}`, { x: 135, y: height - 525, size: 9, font: fontRegular, color: rgb(0, 0, 0) });

      page.drawText(`Address:`, { x: 330, y: height - 510, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });

      const customerMaxLineLength = 30;
      let customerAddress = voucherData.customerAddress.trim().replace(/\s+/g, " ");
      let customerFirstLine = customerAddress.substring(0, customerMaxLineLength);
      let customerSecondLine = customerAddress.substring(customerMaxLineLength, customerMaxLineLength * 2);
      let customerThirdLine = customerAddress.substring(customerMaxLineLength * 2, customerMaxLineLength * 3);
      page.drawText(customerFirstLine, {
        x: 350,
        y: height - 525,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });

      page.drawText(customerSecondLine, {
        x: 350,
        y: height - 525 - 9.5,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      page.drawText(customerThirdLine, {
        x: 350,
        y: height - 525 - 19,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Pin code:`, { x: 115, y: height - 540, size: 8, font: fontRegular, color: rgb(116 / 255, 127 / 255, 141 / 255) });
      page.drawText(`${voucherData.customerPincode}`, { x: 135, y: height - 555, size: 9, font: fontRegular, color: rgb(0, 0, 0) });
      page.drawRectangle({
        x: 50,
        y: height - 750,
        width: 490,
        height: 140,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(116 / 255, 127 / 255, 141 / 255)
      });
      const needhelp = needHelp;
      const connectIndia = connectIndiaEnterprises;
      const isHereForYou = ishereForYou;
      const needhelpWidth = fontRegular.widthOfTextAtSize(needhelp, 10);
      const isHereForYouWidth = fontRegular.widthOfTextAtSize(isHereForYou, 17);
      const connectIndiaWidth = font.widthOfTextAtSize(connectIndia, 9);
      const startnX = 60;
      const startnY = height - 625;

      page.drawText(needhelp, { x: startnX, y: startnY, size: 9, font: fontRegular, color: blackColor });
      page.drawText(connectIndia, { x: startnX + needhelpWidth, y: startnY, size: 9, font: font, color: brownColor });
      page.drawText(isHereForYou, { x: startnX + needhelpWidth + isHereForYouWidth, y: startnY, size: 9, font: fontRegular, color: blackColor });

      page.drawRectangle({
        x: 90,
        y: height - 710,
        width: 410,
        height: 60,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(116 / 255, 127 / 255, 141 / 255)
      });
      page.drawRectangle({
        x: 90,
        y: height - 670,
        width: 410,
        height: 20,
        color: brownColor,
        borderWidth: 0,
      });
      page.drawText('Support Features:', {
        x: 100,
        y: height - 665,
        size: 10,
        font: fontRegular,
        color: rgb(255 / 255, 255 / 255, 255 / 255)
      });
      page.drawImage(logoSupportImage, { x: 115, y: height - 696, width: 13, height: 13 });
      page.drawImage(logoResolutionImage, { x: 235, y: height - 696, width: 13, height: 13 });
      page.drawImage(logoMultilingualImage, { x: 345, y: height - 696, width: 14, height: 14 });
      page.drawText('24x7 Support', {
        x: 135,
        y: height - 695,
        size: 9,
        font: fontRegular,
        color: blackColor
      });
      page.drawText('Quick Resolution', {
        x: 255,
        y: height - 695,
        size: 9,
        font: fontRegular,
        color: blackColor
      });
      page.drawText('Multilingual', {
        x: 365,
        y: height - 695,
        size: 9,
        font: fontRegular,
        color: blackColor
      });

      page.drawText(`Visit us at `, {
        x: 60,
        y: height - 740,
        size: 9,
        font: fontRegular,
        color: blackColor
      });
      page.drawText(`http://connectindiaenterprises.com`, {
        x: 103,
        y: height - 740,
        size: 9,
        font: fontRegular,
        color: rgb(77 / 255, 121 / 255, 255 / 255,)
      });
      // async function drawQRCodeOnPdfPage(
      //   page: PDFPage,
      //   vendorName: string,
      //   customerName: string,
      //   position: { x: number, y: number },
      //   pdfDoc: PDFDocument,
      //   font: PDFFont,
      //   voucherImageUrl: string
      // ): Promise<void> {
      //   const vendor = vendorName.trim().slice(0, 3).toUpperCase();
      //   const customer = customerName.trim().slice(0, 3).toUpperCase();
      //   const now = new Date();
      //   const date = now.toISOString().slice(0, 10).replace(/-/g, '');
      //   const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
      //   const uniqueCode = `${vendor}${customer}${date}${time}`;

      //   const qrContent = `${voucherImageUrl}?code=${uniqueCode}`;
      //   const qrDataUrl = await QRCode.toDataURL(qrContent, { errorCorrectionLevel: 'H' });
      //   const qrImageBase64 = qrDataUrl.split(',')[1];
      //   const qrImage = await pdfDoc.embedPng(qrImageBase64);
      //   const qrDims = qrImage.scale(1);

      //   const imageHeight = 80; // optional: adjust image size

      //   // Embed the image (voucher image) from URL
      //   const imageBytes = await fetch(voucherImageUrl).then(res => res.arrayBuffer());
      //   const voucherImg = await pdfDoc.embedJpg(imageBytes); // or embedPng if it's a PNG
      //   const voucherDims = voucherImg.scale(1);

      //   const height = page.getHeight();

      //   // Draw the QR code
      //   page.drawImage(qrImage, {
      //     x: position.x,
      //     y: height - position.y,
      //     width: 40,
      //     height: 40,
      //   });
      // }
      // await drawQRCodeOnPdfPage(
      //   page,
      //   voucherData.vendorBusinessName,
      //   voucherData.customerName,
      //   { x: 75, y: 805 },
      //   pdfDoc,
      //   fontRegular,
      //   'https://connect-india-enterprises-bucket.s3.ap-south-1.amazonaws.com/profileImage/1749551071549-admin.jpeg'
      // );
      // Draw signature text
      page.drawText('Authorized Signatory', {
        x: 60,
        y: height - 815,
        size: 9,
        font: fontRegular,
        color: blackColor,
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const pdfPath = path.join(outputDir, `${pdfName}.pdf`);
      fs.writeFileSync(pdfPath, pdfBytes);

      return pdfPath;
    } catch (error) {
      console.error(errorGeneratingPDF, error);
      return null;
    }
  }
}

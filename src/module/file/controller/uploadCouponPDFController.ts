import { Controller, Post, UploadedFile, UseInterceptors, Body, Res, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadCouponPDFService } from '../service/uploadCouponPDfService';
import { FileUploadDto } from '../dto/fileUploadDTO';
import { JoiValidationPipe } from '../common/joi/fileUploadValidation';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
    anUnexpectedErrorOccurredDuringFileUpload,
    AWSBucketName,
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    couponPDFFileControllerAWSBucketNameNotDefinedInEnvironment,
    couponPDFFileControllerCouponPDFUploadedSuccessfully,
    couponPDFFileControllerCouponPDFUploadFailed,
    couponPDFFileControllerIncomingPDFUploadRequest,
    couponPDFFileControllerUnexpectedErrorDuringPDFUpload,
    fileNotUploaded
} from '../common/message/messageFileUpload';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('uploadFile/couponPDF')
@UseGuards(AuthGuard)
export class CouponPDFFileController {
    constructor(
        private readonly uploadCouponPDFService: UploadCouponPDFService,
        private readonly configService: ConfigService,
        private readonly logger: AppLogger
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body(new JoiValidationPipe()) body: FileUploadDto,
        @Res() res: Response,
        @Req() req
    ) {
        const userId = req.user.id;
        this.logger.doLog(
            `${couponPDFFileControllerIncomingPDFUploadRequest} (userId: ${userId})`,
            'info'
        );

        try {
            const bucket = this.configService.get<string>(AWSBucketName);

            if (!bucket) {
                this.logger.doLog(
                    `${couponPDFFileControllerAWSBucketNameNotDefinedInEnvironment} (userId: ${userId})`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
                    result: null,
                });
            }

            const uploadResult = await this.uploadCouponPDFService.uploadFile(file);

            if (uploadResult?.status) {
                this.logger.doLog(
                    `${couponPDFFileControllerCouponPDFUploadedSuccessfully} (userId: ${userId})`,
                    'success'
                );
                return res.status(200).send({
                    status: true,
                    message: uploadResult.message,
                    result: uploadResult.data,
                });
            } else {
                this.logger.doLog(
                    `${couponPDFFileControllerCouponPDFUploadFailed} (userId: ${userId}). Message: ${uploadResult?.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: fileNotUploaded,
                });
            }
        } catch (error: any) {
            this.logger.doLog(
                `${couponPDFFileControllerUnexpectedErrorDuringPDFUpload} (userId: ${userId}). Error: ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                message: error.message || anUnexpectedErrorOccurredDuringFileUpload,
                result: null,
            });
        }
    }
}

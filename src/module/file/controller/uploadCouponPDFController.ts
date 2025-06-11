import { Controller, Post, UploadedFile, UseInterceptors, Body, HttpException, Res, Req, UseGuards } from '@nestjs/common';
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
    fileIsNotUploaded
} from '../common/message/messageFileUpload';

@Controller('uploadFile/couponPDF')
@UseGuards(AuthGuard)
export class CouponPDFFileController {
    constructor(
        private readonly uploadCouponPDFService: UploadCouponPDFService,
        private readonly configService: ConfigService,
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body(new JoiValidationPipe()) body: FileUploadDto,
        @Res() res: Response,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const bucket = this.configService.get<string>(AWSBucketName);

            if (!bucket) {
                return res.status(400).send({
                    status: false,
                    message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
                    result: null,
                });
            }
            const uploadResult = await this.uploadCouponPDFService.uploadFile(file);
            if (uploadResult?.status) {
                return res.status(200).send({
                    status: true,
                    message: uploadResult.message,
                    result: uploadResult.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: fileIsNotUploaded,
                });
            }
        } catch (error: any) {
            return res.status(500).send({
                status: false,
                message: error.message || anUnexpectedErrorOccurredDuringFileUpload,
                result: null,
            });
        }
    }
}

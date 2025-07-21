import { Controller, Post, UploadedFile, UseInterceptors, Body, HttpException, Res, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentForServiceTypeByUserService } from '../service/uploadDocumnetForServiceTypeByUserService';
import { FileUploadDto } from '../dto/fileUploadDTO';
import { JoiValidationPipe } from '../common/joi/fileUploadValidation';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
    anUnexpectedErrorOccurredDuringFileUpload,
    AWSBucketName,
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileNotUploaded,
    folderNameRequired
} from '../common/message/messageFileUpload';

@Controller('uploadDocumentSerciceTypeFile/dynamic')
@UseGuards(AuthGuard)
export class UploadDocumentForServiceTypeByUserController {
    constructor(
        private readonly uploadDocumentService: UploadDocumentForServiceTypeByUserService,
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
            const { folderName } = body;

            if (!bucket) {
                return res.status(400).send({
                    status: false,
                    message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
                    result: null,
                });
            }

            if (!folderName) {
                return res.status(400).send({
                    status: false,
                    message: folderNameRequired,
                    result: null,
                });
            }

            const uploadResult = await this.uploadDocumentService.uploadFile(file, folderName);

            if (uploadResult?.status) {
                return res.status(200).send({
                    status: true,
                    message: uploadResult.message,
                    result: uploadResult.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: uploadResult.message || fileNotUploaded,
                    result: null,
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
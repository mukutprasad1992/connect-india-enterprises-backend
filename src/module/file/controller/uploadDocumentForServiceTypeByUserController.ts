import { Controller, Post, UploadedFile, UseInterceptors, Body, Res, Req, UseGuards } from '@nestjs/common';
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
    folderNameRequired,
    uploadDocumentForServiceTypeByUserControllerAWSBucketNameNotDefinedInEnvironment,
    uploadDocumentForServiceTypeByUserControllerDocumentUploadedSuccessfully,
    uploadDocumentForServiceTypeByUserControllerDocumentUploadFailed,
    uploadDocumentForServiceTypeByUserControllerFolderNameMissingInRequest,
    uploadDocumentForServiceTypeByUserControllerIncomingDocumentUploadRequest,
    uploadDocumentForServiceTypeByUserControllerUnexpectedErrorDuringDocumentUpload
} from '../common/message/messageFileUpload';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('uploadDocumentSerciceTypeFile/dynamic')
@UseGuards(AuthGuard)
export class UploadDocumentForServiceTypeByUserController {
    constructor(
        private readonly uploadDocumentService: UploadDocumentForServiceTypeByUserService,
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
        const { folderName } = body;

        this.logger.doLog(
            `${uploadDocumentForServiceTypeByUserControllerIncomingDocumentUploadRequest} (userId: ${userId}, folder: ${folderName})`,
            'info'
        );

        try {
            const bucket = this.configService.get<string>(AWSBucketName);

            if (!bucket) {
                this.logger.doLog(
                    `${uploadDocumentForServiceTypeByUserControllerAWSBucketNameNotDefinedInEnvironment} (userId: ${userId})`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
                    result: null,
                });
            }

            if (!folderName) {
                this.logger.doLog(
                    `${uploadDocumentForServiceTypeByUserControllerFolderNameMissingInRequest} (userId: ${userId})`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: folderNameRequired,
                    result: null,
                });
            }

            const uploadResult = await this.uploadDocumentService.uploadFile(file, folderName);

            if (uploadResult?.status) {
                this.logger.doLog(
                    `${uploadDocumentForServiceTypeByUserControllerDocumentUploadedSuccessfully} (userId: ${userId}, folder: ${folderName})`,
                    'success'
                );
                return res.status(200).send({
                    status: true,
                    message: uploadResult.message,
                    result: uploadResult.data,
                });
            } else {
                this.logger.doLog(
                    `${uploadDocumentForServiceTypeByUserControllerDocumentUploadFailed} (userId: ${userId}, folder: ${folderName}). Message: ${uploadResult?.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: uploadResult.message || fileNotUploaded,
                    result: null,
                });
            }
        } catch (error: any) {
            this.logger.doLog(
                `${uploadDocumentForServiceTypeByUserControllerUnexpectedErrorDuringDocumentUpload} (userId: ${userId}, folder: ${folderName}). Error: ${error.message}`,
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

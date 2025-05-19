import { Controller, Post, UploadedFile, UseInterceptors, Body, HttpException, HttpStatus, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../service/fileUploadService';
import { FileUploadDto } from '../dto/fileUploadDTO';
import { JoiValidationPipe } from '../common/joi/fileUploadValidation';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
    anUnexpectedErrorOccurredDuringFileUpload,
    AWSBucketName,
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileIsNotUploaded
} from '../common/message/messageFileUpload';

@Controller('files')
export class FileController {
    constructor(
        private readonly fileService: FileUploadService,
        private readonly configService: ConfigService,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body(new JoiValidationPipe()) body: FileUploadDto,
        @Res() res: Response,
    ) {
        try {
            const bucket = this.configService.get<string>(AWSBucketName);
            if (!bucket) {
                return res.status(400).send({
                    status: false,
                    message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
                    result: null,
                });
            }
            const uploadResult = await this.fileService.uploadFile(file);
            if (!uploadResult?.status === false) {
                return res.status(400).send({
                    status: false,
                    message: fileIsNotUploaded,
                })

            }
            else {
                return res.status(200).send({
                    status: uploadResult.status,
                    message: uploadResult.message,
                    result: uploadResult.data,
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

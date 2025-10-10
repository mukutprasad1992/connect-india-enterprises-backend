import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileUploadedSuccessfully,
    fileNotUpload,
    AWSBUCKETNAMEIsnotDefinedInEnvironmentVariables,
    preparingToUploadCouponPDF,
    couponPDFUploadedSuccessfullyKey,
    errorUploadingCouponPDFFile,
} from '../common/message/messageFileUpload';
import { s3 } from '../../../config/awsConfig';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UploadCouponPDFService {
    constructor(private readonly logger: AppLogger) { }

    async uploadFile(file: Express.Multer.File) {
        const bucket = process.env.AWS_BUCKET_NAME;

        if (!bucket) {
            this.logger.doLog(
                AWSBUCKETNAMEIsnotDefinedInEnvironmentVariables,
                'error'
            );
            return {
                status: false,
                message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
            };
        }

        const key = `couponPDFFile/${Date.now()}-${file.originalname}`;
        this.logger.doLog(
            `${preparingToUploadCouponPDF} ${file.originalname} as key: ${key}`,
            'info'
        );

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await s3.send(command);

            const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            this.logger.doLog(
                `${couponPDFUploadedSuccessfullyKey} = ${key}, Size=${file.size} bytes, URL=${fileUrl}`,
                'success'
            );

            return {
                status: true,
                message: fileUploadedSuccessfully,
                data: {
                    url: fileUrl,
                    key,
                    size: file.size,
                    mimetype: file.mimetype,
                },
            };
        } catch (error: any) {
            this.logger.doLog(
                `${errorUploadingCouponPDFFile} = ${file.originalname}, Error=${error.message}`,
                'error'
            );

            return {
                status: false,
                message: fileNotUpload,
                error: error.message,
            };
        }
    }
}

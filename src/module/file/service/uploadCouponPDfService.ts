import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';
import {
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileNotUpload,
    fileUploadedSuccessfully,
} from '../common/message/messageFileUpload';
import { s3 } from '../../../config/awsConfig'
@Injectable()
export class UploadCouponPDFService {

    async uploadFile(file: Express.Multer.File) {
        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket) {
            return {
                status: false,
                message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
            };
        }

        const key = `couponPDFFile/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await s3.send(command);

            return {
                status: true,
                message: fileUploadedSuccessfully,
                data: {
                    url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
                    key,
                    size: file.size,
                    mimetype: file.mimetype,
                },
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message,
            };
        }
    }
}

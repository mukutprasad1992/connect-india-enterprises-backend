import { Injectable } from '@nestjs/common';
import {
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import {
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileNotUploaded,
    fileUploadedSuccessfully,
    folderNameRequired,
} from '../common/message/messageFileUpload';
import { s3 } from '../../../config/awsConfig';

@Injectable()
export class UploadDocumentForServiceTypeByUserService {
    async uploadFile(
        file: Express.Multer.File,
        folderName: string,
    ) {
        if (!folderName) {
            return {
                status: false,
                message: folderNameRequired,
            };
        }

        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket) {
            return {
                status: false,
                message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
            };
        }

        if (!file) {
            return {
                status: false,
                message: fileNotUploaded,
            };
        }
        const key = `${folderName}/${Date.now()}-${file.originalname}`;

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
                    folderName,
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
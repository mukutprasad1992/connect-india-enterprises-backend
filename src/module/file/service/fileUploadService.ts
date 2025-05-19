import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { s3 } from '../../../config/awsConfig';
import {
    AWSBucketNameIsNotDefinedInEnvironmentVariables,
    fileUloadedSuccessfully
} from '../common/message/messageFileUpload';

@Injectable()
export class FileUploadService {
    async uploadFile(file: Express.Multer.File) {
        const bucket = process.env.AWS_BUCKET_NAME;

        if (!bucket) {
            return {
                status: false,
                message: AWSBucketNameIsNotDefinedInEnvironmentVariables
            }
        }

        const params = {
            Bucket: bucket,
            Key: `profileImage/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // uncomment if you want public access
        };
        try {
            const result = await s3.upload(params).promise();
            return {
                status: true,
                message: fileUloadedSuccessfully,
                data: {
                    url: result.Location,
                    key: result.Key,
                    size: file.size,
                    mimetype: file.mimetype,
                }
            };
        } catch (error: any) {
            return {
                status: false,
                message: error.message
            }
        }
    }
}

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
    fileUloadedSuccessfully,
} from '../common/message/messageFileUpload';
import { s3 } from '../../../config/awsConfig'
@Injectable()
export class ProfileImageUploadService {
    async deleteFileFromS3(key: string) {
        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket) return;

        try {
            const versions = await s3.send(new ListObjectVersionsCommand({
                Bucket: bucket,
                Prefix: key,
            }));

            const allVersions = [
                ...(versions.Versions || []),
                ...(versions.DeleteMarkers || []),
            ];

            for (const version of allVersions) {
                if (version.Key === key && version.VersionId) {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        VersionId: version.VersionId,
                    }));
                }
            }
        } catch (error) {
            console.error(`Error deleting S3 versions:`, error);
        }
    }

    async uploadFile(file: Express.Multer.File) {
        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket) {
            return {
                status: false,
                message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
            };
        }

        const key = `profileImage/${Date.now()}-${file.originalname}`;

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
                message: fileUloadedSuccessfully,
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

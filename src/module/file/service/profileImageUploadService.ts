import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';
import {
  AWSBucketNameIsNotDefinedInEnvironmentVariables,
  fileUploadedSuccessfully,
  fileNotUpload,
  cannotDeleteFileFromS3InvalidBucketOrKeyBucket,
  fetchingAllVersionsForS3Key,
  versionsForKey,
  deletedVersionId,
  successfullyDeletedAllVersionsOfFile,
  errorDeletingFileFromS3Key,
  uploadFailedAWSBUCKETNAMEIsMissingInEnvironmentVariables,
  preparingToUploadFile,
  fileUploadedSuccessfullyKey,
  fileUploadFailedFile,
} from '../common/message/messageFileUpload';
import { s3 } from '../../../config/awsConfig';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class ProfileImageUploadService {
  constructor(private readonly logger: AppLogger) {}

  async deleteFileFromS3(key: string) {
    const bucket = process.env.AWS_BUCKET_NAME;

    if (!bucket || !key) {
      this.logger.doLog(
        `${cannotDeleteFileFromS3InvalidBucketOrKeyBucket} = ${bucket}, key=${key}`,
        'warn',
      );
      return;
    }

    try {
      this.logger.doLog(`${fetchingAllVersionsForS3Key} ${key}`, 'info');

      const versions = await s3.send(
        new ListObjectVersionsCommand({
          Bucket: bucket,
          Prefix: key,
        }),
      );

      const allVersions = [
        ...(versions.Versions || []),
        ...(versions.DeleteMarkers || []),
      ];

      this.logger.doLog(
        `Found ${allVersions.length} ${versionsForKey} ${key}`,
        'info',
      );

      for (const version of allVersions) {
        if (version.Key === key && version.VersionId) {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: bucket,
              Key: key,
              VersionId: version.VersionId,
            }),
          );
          this.logger.doLog(
            `${deletedVersionId} = ${version.VersionId} for key=${key}`,
            'success',
          );
        }
      }

      this.logger.doLog(
        `${successfullyDeletedAllVersionsOfFile} ${key}`,
        'success',
      );
    } catch (error: any) {
      this.logger.doLog(
        `${errorDeletingFileFromS3Key} = ${key}, Error=${error.message}`,
        'error',
      );
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const bucket = process.env.AWS_BUCKET_NAME;

    if (!bucket) {
      this.logger.doLog(
        uploadFailedAWSBUCKETNAMEIsMissingInEnvironmentVariables,
        'error',
      );
      return {
        status: false,
        message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
      };
    }

    const key = `profileImage/${Date.now()}-${file.originalname}`;
    this.logger.doLog(
      `${preparingToUploadFile} ${file.originalname} as ${key}`,
      'info',
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
        `${fileUploadedSuccessfullyKey} = ${key}, Size=${file.size} bytes`,
        'success',
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
        `${fileUploadFailedFile} = ${file.originalname}, Error=${error.message}`,
        'error',
      );

      return {
        status: false,
        message: fileNotUpload,
        error: error.message,
      };
    }
  }
}

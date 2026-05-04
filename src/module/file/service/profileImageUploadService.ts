// import { Injectable } from '@nestjs/common';
// import {
//   PutObjectCommand,
//   DeleteObjectCommand,
//   ListObjectVersionsCommand,
// } from '@aws-sdk/client-s3';
// import {
//   AWSBucketNameIsNotDefinedInEnvironmentVariables,
//   fileUploadedSuccessfully,
//   fileNotUpload,
//   cannotDeleteFileFromS3InvalidBucketOrKeyBucket,
//   fetchingAllVersionsForS3Key,
//   versionsForKey,
//   deletedVersionId,
//   successfullyDeletedAllVersionsOfFile,
//   errorDeletingFileFromS3Key,
//   uploadFailedAWSBUCKETNAMEIsMissingInEnvironmentVariables,
//   preparingToUploadFile,
//   fileUploadedSuccessfullyKey,
//   fileUploadFailedFile,
// } from '../common/message/messageFileUpload';
// import { s3 } from '../../../config/awsConfig';
// import { AppLogger } from 'src/utils/common/loggerService';

// @Injectable()
// export class ProfileImageUploadService {
//   constructor(private readonly logger: AppLogger) {}

//   async deleteFileFromS3(key: string) {
//     const bucket = process.env.AWS_BUCKET_NAME;

//     if (!bucket || !key) {
//       this.logger.doLog(
//         `${cannotDeleteFileFromS3InvalidBucketOrKeyBucket} = ${bucket}, key=${key}`,
//         'warn',
//       );
//       return;
//     }

//     try {
//       this.logger.doLog(`${fetchingAllVersionsForS3Key} ${key}`, 'info');

//       const versions = await s3.send(
//         new ListObjectVersionsCommand({
//           Bucket: bucket,
//           Prefix: key,
//         }),
//       );

//       const allVersions = [
//         ...(versions.Versions || []),
//         ...(versions.DeleteMarkers || []),
//       ];

//       this.logger.doLog(
//         `Found ${allVersions.length} ${versionsForKey} ${key}`,
//         'info',
//       );

//       for (const version of allVersions) {
//         if (version.Key === key && version.VersionId) {
//           await s3.send(
//             new DeleteObjectCommand({
//               Bucket: bucket,
//               Key: key,
//               VersionId: version.VersionId,
//             }),
//           );
//           this.logger.doLog(
//             `${deletedVersionId} = ${version.VersionId} for key=${key}`,
//             'success',
//           );
//         }
//       }

//       this.logger.doLog(
//         `${successfullyDeletedAllVersionsOfFile} ${key}`,
//         'success',
//       );
//     } catch (error: any) {
//       this.logger.doLog(
//         `${errorDeletingFileFromS3Key} = ${key}, Error=${error.message}`,
//         'error',
//       );
//     }
//   }

//   async uploadFile(file: Express.Multer.File) {
//     const bucket = process.env.AWS_BUCKET_NAME;

//     if (!bucket) {
//       this.logger.doLog(
//         uploadFailedAWSBUCKETNAMEIsMissingInEnvironmentVariables,
//         'error',
//       );
//       return {
//         status: false,
//         message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
//       };
//     }

//     const key = `profileImage/${Date.now()}-${file.originalname}`;
//     this.logger.doLog(
//       `${preparingToUploadFile} ${file.originalname} as ${key}`,
//       'info',
//     );

//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: key,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     });

//     try {
//       await s3.send(command);
//       const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//       this.logger.doLog(
//         `${fileUploadedSuccessfullyKey} = ${key}, Size=${file.size} bytes`,
//         'success',
//       );

//       return {
//         status: true,
//         message: fileUploadedSuccessfully,
//         data: {
//           url: fileUrl,
//           key,
//           size: file.size,
//           mimetype: file.mimetype,
//         },
//       };
//     } catch (error: any) {
//       this.logger.doLog(
//         `${fileUploadFailedFile} = ${file.originalname}, Error=${error.message}`,
//         'error',
//       );

//       return {
//         status: false,
//         message: fileNotUpload,
//         error: error.message,
//       };
//     }
//   }
// }



import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/utils/common/loggerService';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

@Injectable()
export class ProfileImageUploadService {
  constructor(private readonly logger: AppLogger, private readonly dataSource: DataSource) {}

  async uploadFile(userId: number, file: Express.Multer.File) {
    try {
      const uploadPath = path.join(__dirname,'..',
        '..',
        '..',
        '..', 'uploads', 'profileImage');
      // Create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);

      // Save file locally
      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `http://localhost:5000/uploads/profileImage/${fileName}`;

      const query = `UPDATE users SET profileImageURL = ?, profileImageKey = ? WHERE id = ?`;
      const result = await this.dataSource.query(query, [fileUrl, fileName, userId]);

      this.logger.doLog(`File uploaded locally: ${fileName}`, 'success');

      return {
        status: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          fileName,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error: any) {
      this.logger.doLog(`Upload failed: ${error.message}`, 'error');

      return {
        status: false,
        message: 'File upload failed',
        error: error.message,
      };
    }
  }

  async deleteFile(fileName: string) {
    try {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'uploads',
        'profileImage',
        fileName,
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.doLog(`File deleted: ${fileName}`, 'success');
      } else {
        this.logger.doLog(`File not found: ${fileName}`, 'warn');
      }
    } catch (error: any) {
      this.logger.doLog(`Delete failed: ${error.message}`, 'error');
    }
  }
}
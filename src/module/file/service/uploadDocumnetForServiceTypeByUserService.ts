// import { Injectable } from '@nestjs/common';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import {
//   AWSBucketNameIsNotDefinedInEnvironmentVariables,
//   errorUploadingFileFolder,
//   fileNotUploaded,
//   fileUploadedSuccessfully,
//   fileUploadedSuccessfullyFolder,
//   folderNameRequired,
//   preparingToUploadFile,
//   startingDocumentUploadForServiceTypeFolder,
//   uploadFailedAWSBUCKETNAMENotFoundInEnvironmentVariables,
//   uploadFailedFolderNameIsRequired,
//   uploadFailedNoFileReceivedInRequest,
// } from '../common/message/messageFileUpload';
// import { s3 } from '../../../config/awsConfig';
// import { AppLogger } from 'src/utils/common/loggerService';

// @Injectable()
// export class UploadDocumentForServiceTypeByUserService {
//   constructor(private readonly logger: AppLogger) {}

//   async uploadFile(file: Express.Multer.File, folderName: string) {
//     this.logger.doLog(
//       `${startingDocumentUploadForServiceTypeFolder} ${folderName}`,
//       'info',
//     );

//     if (!folderName) {
//       this.logger.doLog(`${uploadFailedFolderNameIsRequired}`, 'warn');
//       return {
//         status: false,
//         message: folderNameRequired,
//       };
//     }

//     const bucket = process.env.AWS_BUCKET_NAME;
//     if (!bucket) {
//       this.logger.doLog(
//         uploadFailedAWSBUCKETNAMENotFoundInEnvironmentVariables,
//         'error',
//       );
//       return {
//         status: false,
//         message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
//       };
//     }

//     if (!file) {
//       this.logger.doLog(uploadFailedNoFileReceivedInRequest, 'warn');
//       return {
//         status: false,
//         message: fileNotUploaded,
//       };
//     }

//     const key = `${folderName}/${Date.now()}-${file.originalname}`;
//     this.logger.doLog(
//       `${preparingToUploadFile} ${file.originalname} to folder: ${folderName} with key: ${key}`,
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
//         `${fileUploadedSuccessfullyFolder} = ${folderName}, Key=${key}, Size=${file.size} bytes, URL=${fileUrl}`,
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
//           folderName,
//         },
//       };
//     } catch (error: any) {
//       this.logger.doLog(
//         `${errorUploadingFileFolder} = ${folderName}, File=${file.originalname}, Error=${error.message}`,
//         'error',
//       );

//       return {
//         status: false,
//         message: fileNotUploaded,
//         error: error.message,
//       };
//     }
//   }
// }


import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  errorUploadingFileFolder,
  fileNotUploaded,
  fileUploadedSuccessfully,
  fileUploadedSuccessfullyFolder,
  folderNameRequired,
  preparingToUploadFile,
  startingDocumentUploadForServiceTypeFolder,
  uploadFailedFolderNameIsRequired,
  uploadFailedNoFileReceivedInRequest,
} from '../common/message/messageFileUpload';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class UploadDocumentForServiceTypeByUserService {
  constructor(private readonly logger: AppLogger) {}

  async uploadFile(file: Express.Multer.File, folderName: string) {
    this.logger.doLog(
      `${startingDocumentUploadForServiceTypeFolder} ${folderName}`,
      'info',
    );

    // ✅ Folder validation
    if (!folderName) {
      this.logger.doLog(uploadFailedFolderNameIsRequired, 'warn');
      return {
        status: false,
        message: folderNameRequired,
      };
    }

    // ✅ File validation
    if (!file) {
      this.logger.doLog(uploadFailedNoFileReceivedInRequest, 'warn');
      return {
        status: false,
        message: fileNotUploaded,
      };
    }

    try {
      // ✅ Sanitize folder name (security)
      const safeFolder = folderName.replace(/[^a-zA-Z0-9_-]/g, '');

      // ✅ Correct path (project root)
      const uploadPath = path.join(__dirname,'..',
        '..',
        '..',
        '..', 'uploads', safeFolder);

      // ✅ Create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);

      this.logger.doLog(
        `${preparingToUploadFile} ${file.originalname} to folder: ${safeFolder}`,
        'info',
      );

      // ✅ Save file locally
      fs.writeFileSync(filePath, file.buffer);

      // ✅ Generate local URL
      const fileUrl = `http://localhost:5000/uploads/${safeFolder}/${fileName}`;

      this.logger.doLog(
        `${fileUploadedSuccessfullyFolder} = ${safeFolder}, File=${fileName}, Size=${file.size} bytes`,
        'success',
      );

      return {
        status: true,
        message: fileUploadedSuccessfully,
        data: {
          url: fileUrl,
          fileName,
          folderName: safeFolder,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorUploadingFileFolder} = ${folderName}, File=${file?.originalname}, Error=${error.message}`,
        'error',
      );

      return {
        status: false,
        message: fileNotUploaded,
        error: error.message,
      };
    }
  }
}
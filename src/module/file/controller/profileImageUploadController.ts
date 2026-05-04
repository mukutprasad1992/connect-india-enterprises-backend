// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   Body,
//   Res,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ProfileImageUploadService } from '../service/profileImageUploadService';
// import { FileUploadDto } from '../dto/fileUploadDTO';
// import { JoiValidationPipe } from '../common/joi/fileUploadValidation';
// import { ConfigService } from '@nestjs/config';
// import { Response } from 'express';
// import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
// import {
//   anUnexpectedErrorOccurredDuringFileUpload,
//   AWSBucketName,
//   AWSBucketNameIsNotDefinedInEnvironmentVariables,
//   fileNotUploaded,
//   profileImageUploadControllerAWSBucketNameNotDefinedInEnvironment,
//   profileImageUploadControllerDeletingExistingProfileImageFromS3,
//   profileImageUploadControllerIncomingProfileImageUploadRequest,
//   profileImageUploadControllerProfileImageUploadedSuccessfully,
//   profileImageUploadControllerProfileImageUploadFailed,
//   profileImageUploadControllerUnexpectedErrorDuringProfileImageUpload,
// } from '../common/message/messageFileUpload';
// import { GetUserByIdService } from '../../user/service/getUserByIdService';
// import { AppLogger } from 'src/utils/common/loggerService';

// @Controller('files')
// @UseGuards(AuthGuard)
// export class ProfileImageUploadController {
//   constructor(
//     private readonly profileImageUploadService: ProfileImageUploadService,
//     private readonly configService: ConfigService,
//     private readonly userService: GetUserByIdService,
//     private readonly logger: AppLogger,
//   ) {}

//   @Post('profileImageUpload')
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadFile(
//     @UploadedFile() file: Express.Multer.File,
//     @Body(new JoiValidationPipe()) body: FileUploadDto,
//     @Res() res: Response,
//     @Req() req,
//   ) {
//     const userId = req.user.id;
//     this.logger.doLog(
//       `${profileImageUploadControllerIncomingProfileImageUploadRequest} (userId: ${userId})`,
//       'info',
//     );

//     try {
//       const bucket = this.configService.get<string>(AWSBucketName);

//       if (!bucket) {
//         this.logger.doLog(
//           `${profileImageUploadControllerAWSBucketNameNotDefinedInEnvironment} (userId: ${userId})`,
//           'warn',
//         );
//         return res.status(400).send({
//           status: false,
//           message: AWSBucketNameIsNotDefinedInEnvironmentVariables,
//           result: null,
//         });
//       }

//       const user = await this.userService.getUserById(userId);

//       if (user?.data?.profileImageKey) {
//         this.logger.doLog(
//           `${profileImageUploadControllerDeletingExistingProfileImageFromS3} (userId: ${userId})`,
//           'info',
//         );
//         await this.profileImageUploadService.deleteFileFromS3(
//           user.data.profileImageKey,
//         );
//       }

//       const uploadResult =
//         await this.profileImageUploadService.uploadFile(file);

//       if (uploadResult?.status) {
//         this.logger.doLog(
//           `${profileImageUploadControllerProfileImageUploadedSuccessfully} (userId: ${userId})`,
//           'success',
//         );
//         return res.status(200).send({
//           status: true,
//           message: uploadResult.message,
//           result: uploadResult.data,
//         });
//       } else {
//         this.logger.doLog(
//           `${profileImageUploadControllerProfileImageUploadFailed} (userId: ${userId}). Message: ${uploadResult?.message}`,
//           'warn',
//         );
//         return res.status(400).send({
//           status: false,
//           message: fileNotUploaded,
//         });
//       }
//     } catch (error: any) {
//       this.logger.doLog(
//         `${profileImageUploadControllerUnexpectedErrorDuringProfileImageUpload} (userId: ${userId}). Error: ${error.message}`,
//         'error',
//       );
//       return res.status(500).send({
//         status: false,
//         message: error.message || anUnexpectedErrorOccurredDuringFileUpload,
//         result: null,
//       });
//     }
//   }
// }

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileImageUploadService } from '../service/profileImageUploadService';
import { FileUploadDto } from '../dto/fileUploadDTO';
import { JoiValidationPipe } from '../common/joi/fileUploadValidation';
import { Response } from 'express';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { GetUserByIdService } from '../../user/service/getUserByIdService';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('files')
@UseGuards(AuthGuard)
export class ProfileImageUploadController {
  constructor(
    private readonly profileImageUploadService: ProfileImageUploadService,
    private readonly userService: GetUserByIdService,
    private readonly logger: AppLogger,
  ) {}

  @Post('profileImageUpload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(new JoiValidationPipe()) body: FileUploadDto,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user.id;

    this.logger.doLog(
      `Incoming profile image upload request (userId: ${userId})`,
      'info',
    );

    try {
      // ✅ Get user
      const user = await this.userService.getUserById(userId);

      // ✅ Delete old file (LOCAL)
      if (user?.data?.profileImageKey) {
        this.logger.doLog(
          `Deleting existing profile image (userId: ${userId})`,
          'info',
        );

        await this.profileImageUploadService.deleteFile(
          user.data.profileImageKey,
        );
      }

      // ✅ Upload new file locally
      const uploadResult =
        await this.profileImageUploadService.uploadFile(userId, file);

      if (uploadResult?.status) {
        this.logger.doLog(
          `Profile image uploaded successfully (userId: ${userId})`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: uploadResult.message,
          result: uploadResult.data,
        });
      } else {
        this.logger.doLog(
          `Profile image upload failed (userId: ${userId})`,
          'warn',
        );

        return res.status(400).send({
          status: false,
          message: 'File not uploaded',
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `Unexpected error during profile image upload (userId: ${userId}) Error: ${error.message}`,
        'error',
      );

      return res.status(500).send({
        status: false,
        message: error.message || 'Unexpected error occurred',
        result: null,
      });
    }
  }
}
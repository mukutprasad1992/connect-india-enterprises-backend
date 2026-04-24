import { Controller, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { DeleteProfileImageService } from '../service/deleteProfileImageService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
  anUnexpectedErrorOccurredWhileDeletingTheFileFromS3,
  deleteProfileImageControllerFailedToDeleteProfileImage,
  deleteProfileImageControllerIncomingRequestToDeleteProfileImage,
  deleteProfileImageControllerProfileImageDeletedSuccessfully,
  deleteProfileImageControllerUnexpectedErrorDeletingProfileImage,
} from '../common/message/messageFileUpload';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('files')
@UseGuards(AuthGuard)
export class DeleteProfileImageController {
  constructor(
    private readonly deleteProfileImageService: DeleteProfileImageService,
    private readonly logger: AppLogger,
  ) {}

  @Delete('deleteProfileImage')
  async deleteProfileImage(@Req() req, @Res() res) {
    const userId = req.user.id;
    this.logger.doLog(
      `${deleteProfileImageControllerIncomingRequestToDeleteProfileImage} (userId: ${userId})`,
      'info',
    );

    try {
      const result =
        await this.deleteProfileImageService.deleteProfileImage(userId);

      if (result.status) {
        this.logger.doLog(
          `${deleteProfileImageControllerProfileImageDeletedSuccessfully} (userId: ${userId})`,
          'success',
        );
        return res.status(200).json({
          status: true,
          message: result.message,
        });
      } else {
        this.logger.doLog(
          `${deleteProfileImageControllerFailedToDeleteProfileImage} (userId: ${userId}). Message: ${result.message}`,
          'warn',
        );
        return res.status(400).json({
          status: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${deleteProfileImageControllerUnexpectedErrorDeletingProfileImage} (userId: ${userId}). Error: ${error.message}`,
        'error',
      );
      return res.status(500).json({
        status: false,
        message:
          error.message || anUnexpectedErrorOccurredWhileDeletingTheFileFromS3,
      });
    }
  }
}

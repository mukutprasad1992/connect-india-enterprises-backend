import { Controller, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { DeleteUserService } from '../service/deleteUserService';
import {
  deleteUserRequestReceivedForID,
  errorOccurredWhileDeletingTheUser,
  errorOccurredWhileDeletingUserID,
  failedToDeleteUserID,
  invalidUserIDProvided,
  userDeletedSuccessfullyID,
} from '../common/userMessage';
import { ValidateUserId } from '../common/commonValidation';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('user/deleteUser/:id')
@UseGuards(AuthGuard)
export class DeleteUserController {
  constructor(
    private readonly DeleteUserService: DeleteUserService,
    private readonly logger: AppLogger,
  ) {}

  @Delete()
  async delete(@Param('id') id: number, @Res() res) {
    this.logger.doLog(`${deleteUserRequestReceivedForID} ${id}`, 'info');

    try {
      const validationResponse = await ValidateUserId.isUserId(id);
      if (validationResponse && validationResponse.statusCode) {
        this.logger.doLog(`${invalidUserIDProvided} ${id}`, 'warn');
        return res.status(400).json({
          status: validationResponse.status,
          message: validationResponse.message,
        });
      }

      const userResponse = await this.DeleteUserService.delete(id);

      if (userResponse.status === true) {
        this.logger.doLog(`${userDeletedSuccessfullyID} ${id}`, 'success');
        return res.status(200).json({
          status: userResponse.status,
          message: userResponse.message,
        });
      } else {
        this.logger.doLog(
          `${failedToDeleteUserID} ${id}, Message: ${userResponse.message}`,
          'warn',
        );
        return res.status(400).json({
          status: userResponse.status,
          message: userResponse.message,
          error: userResponse.error,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileDeletingUserID} ${id}, Error: ${error.message}`,
        'error',
      );
      return res.status(500).json({
        status: false,
        message: errorOccurredWhileDeletingTheUser,
        error: error.message,
      });
    }
  }
}

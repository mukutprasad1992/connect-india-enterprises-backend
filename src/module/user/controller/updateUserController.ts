import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { UpdateUserService } from '../service/updateUserService';
import {
  anErrorOccurredWhileUpdatingTheUser,
  errorOccurredWhileUpdatingUserID,
  failedToUpdateUserForID,
  requestInitiatedByUserID,
  updateUserRequestReceivedForID,
  userUpdatedSuccessfullyForID,
} from '../common/userMessage';
import { ValidationUser } from '../common/joiValidationUser';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('user/updateUser/:id')
@UseGuards(AuthGuard)
export class UpdateUserController {
  constructor(
    private readonly UpdateUserService: UpdateUserService,
    private readonly logger: AppLogger,
  ) {}

  @Put()
  async updateUser(
    @Param('id') id: number,
    @Body(new ValidationUser(UpdateUserDTO.userSchema))
    updateUserDTO: UpdateUserDTO,
    @Res() res,
    @Req() req,
  ) {
    this.logger.doLog(`${updateUserRequestReceivedForID} ${id}`, 'info');

    try {
      const userId = req.user.id;
      this.logger.doLog(`${requestInitiatedByUserID} ${userId}`, 'warn');

      const updatedUser = await this.UpdateUserService.updateUser(
        id,
        updateUserDTO,
        userId,
      );

      if (updatedUser.status === true) {
        this.logger.doLog(`${userUpdatedSuccessfullyForID} ${id}`, 'success');
        return res.status(200).send({
          status: updatedUser.status,
          message: updatedUser.message,
          data: updatedUser.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateUserForID} ${id} — ${updatedUser.message}`,
          'warn',
        );
        return res.status(401).send({
          status: updatedUser.status,
          message: updatedUser.message,
          data: updatedUser.data,
          error: updatedUser.error,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileUpdatingUserID} ${id} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileUpdatingTheUser,
        error: error.message,
        data: null,
      });
    }
  }
}

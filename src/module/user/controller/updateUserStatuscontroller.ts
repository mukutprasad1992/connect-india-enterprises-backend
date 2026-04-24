import {
  Controller,
  Put,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { UpdateUserStatusService } from '../service/updateUserStatusService';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  errorWhileUpdatingUserStatusForID,
  failedToUpdateUserStatusForID,
  receivedRequestToUpdateUserStatusForID,
  requestedByUserID,
  userStatusUpdatedSuccessfullyForID,
} from '../common/userMessage';

@Controller('user/updateUserStatusById/:id')
@UseGuards(AuthGuard)
export class UpdateUserStatusByIdController {
  constructor(
    private readonly updateUserStatusService: UpdateUserStatusService,
    private readonly logger: AppLogger,
  ) {}

  @Put()
  async updateVoucherById(
    @Param('id') id: number,
    @Body() updateUserDTO: UpdateUserDTO,
    @Res() res,
    @Req() req,
  ) {
    this.logger.doLog(
      `${receivedRequestToUpdateUserStatusForID} ${id}`,
      'info',
    );

    try {
      const userId = req.user.id;
      const { status } = updateUserDTO;
      this.logger.doLog(
        `${requestedByUserID} ${userId} — Target ID: ${id} — New Status: ${status}`,
        'warn',
      );

      const voucherResponse =
        await this.updateUserStatusService.updateUserStatus(
          id,
          updateUserDTO,
          userId,
        );

      if (voucherResponse.status) {
        this.logger.doLog(
          `${userStatusUpdatedSuccessfullyForID} ${id}`,
          'success',
        );
        return res.status(200).send({
          status: voucherResponse.status,
          message: voucherResponse.message,
          result: voucherResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateUserStatusForID} ${id} — ${voucherResponse.message}`,
          'warn',
        );
        return res.status(400).send({
          status: false,
          message: voucherResponse.message,
          error: voucherResponse.error,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileUpdatingUserStatusForID} ${id} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        error: error.message,
      });
    }
  }
}

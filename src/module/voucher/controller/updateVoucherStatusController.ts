import {
  Controller,
  Put,
  Param,
  Res,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { UpdateVoucherStatusService } from '../service/updateStatusVoucherService';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  errorWhileUpdatingVoucherStatusForID,
  failedToUpdateStatusForVoucherID,
  forVoucherID,
  requestedToUpdateStatusTo,
  statusUpdatedSuccessfullyByUser,
  updateVoucherStatusByIdControllerCalledByUserID,
  voucherID,
} from '../common/voucherMessage';

@Controller('voucher/updateVoucherStatusById/:id')
@UseGuards(AuthGuard)
export class UpdateVoucherStatusByIdController {
  constructor(
    private readonly updateVoucherStatusService: UpdateVoucherStatusService,
    private readonly logger: AppLogger,
  ) {}

  @Put()
  async updateVoucherById(
    @Param('id') id: number,
    @Body() updateVoucherDTO: UpdateVoucherDTO,
    @Res() res,
    @Req() req,
  ) {
    const userId = req.user?.id;
    this.logger.doLog(
      `${updateVoucherStatusByIdControllerCalledByUserID} ${userId} ${forVoucherID} ${id}`,
      'info',
    );

    try {
      const { status } = updateVoucherDTO;
      this.logger.doLog(
        `${requestedToUpdateStatusTo} "${status}"  ${forVoucherID} ${id}`,
        'info',
      );

      const voucherResponse =
        await this.updateVoucherStatusService.updateVoucherStatus(
          id,
          updateVoucherDTO,
          userId,
        );

      if (voucherResponse.status) {
        this.logger.doLog(
          `${voucherID} ${id} ${statusUpdatedSuccessfullyByUser} ${userId}`,
          'success',
        );
        return res.status(200).send({
          status: voucherResponse.status,
          message: voucherResponse.message,
          result: voucherResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateStatusForVoucherID} ${id} by user ${userId}. Reason: ${voucherResponse.message}`,
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
        `${errorWhileUpdatingVoucherStatusForID} ${id}: ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        error: error.message,
      });
    }
  }
}

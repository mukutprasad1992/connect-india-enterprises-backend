import { Controller, Delete, Res, UseGuards, Req, Param } from '@nestjs/common';
import { DeleteServiceSubTypeByIdService } from '../services/deleteServiceSubTypeService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
  anErrorOccurredWhileDeletingServiceSubType,
  byUserID,
  deletedSuccessfullyByUserID,
  errorDeletingServiceSubTypeID,
  failedToDeleteServiceSubTypeID,
  requestedToDeleteServiceSubTypeID,
  serviceSubTypeID,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/deleteServiceSubTypeById/:id')
export class DeleteServiceSubTypeByIdController {
  constructor(
    private readonly deleteServiceSubTypeByIdService: DeleteServiceSubTypeByIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Delete()
  async deleteServiceSubType(@Param('id') id: number, @Req() req, @Res() res) {
    const userId = req.user.id;
    this.logger.doLog(
      `User ID: ${userId} ${requestedToDeleteServiceSubTypeID} ${id}`,
      'info',
    );

    try {
      const serviceSubTypeResponse =
        await this.deleteServiceSubTypeByIdService.deleteServiceSubTypeById(id);

      if (serviceSubTypeResponse.status === true) {
        this.logger.doLog(
          `${serviceSubTypeID} ${id} ${deletedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return res.status(200).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          result: serviceSubTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToDeleteServiceSubTypeID} ${id} by User ID: ${userId} — Reason: ${serviceSubTypeResponse.message}`,
          'warn',
        );
        return res.status(404).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          error: serviceSubTypeResponse.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorDeletingServiceSubTypeID} ${id} ${byUserID} ${userId} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileDeletingServiceSubType,
        error: error.message,
      });
    }
  }
}

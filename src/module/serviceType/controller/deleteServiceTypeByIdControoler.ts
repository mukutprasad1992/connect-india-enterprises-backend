import { Controller, Delete, Param, Res, UseGuards, Req } from '@nestjs/common';
import { DeleteServiceTypeByIdService } from '../services/deleteServiceTypeByIdServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  byUserID,
  deletedSuccessfullybyuserID,
  deleteRequestReceivedForServiceTypeID,
  errorOccurredWhileDeletingServiceTypeID,
  failedToDeleteServiceTypeID,
  serviceTypeDeletionError,
  serviceTypeWithID,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/deleteServiceTypeById/:id')
export class DeleteServiceTypeByIdController {
  constructor(
    private readonly deleteServiceTypeByIdService: DeleteServiceTypeByIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Delete()
  async deleteServiceTypeById(@Param('id') id: number, @Res() res, @Req() req) {
    const userId = req.user.id;

    this.logger.doLog(
      `${deleteRequestReceivedForServiceTypeID} ${id} by User ID: ${userId}`,
      'success',
    );

    try {
      const deleteResponse =
        await this.deleteServiceTypeByIdService.deleteServiceTypeById(
          id,
          userId,
        );

      if (deleteResponse.status === true) {
        this.logger.doLog(
          `${serviceTypeWithID} ${id} ${deletedSuccessfullybyuserID} ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: deleteResponse.message,
          data: null,
        });
      } else {
        this.logger.doLog(
          `${failedToDeleteServiceTypeID} ${id} ${byUserID} ${userId}. Reason: ${deleteResponse.message}`,
          'fail',
        );

        return res.status(404).send({
          status: false,
          message: deleteResponse.message,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileDeletingServiceTypeID} ${id} ${byUserID} ${userId}. Error: ${error.message}`,
        'fail',
      );

      return res.status(500).send({
        status: false,
        message: serviceTypeDeletionError,
        error: error.message,
      });
    }
  }
}

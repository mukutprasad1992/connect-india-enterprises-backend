import { Controller, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import {
  anErrorOccurredWhileRetrievingServiceSubType,
  byUserID,
  errorFetchingServiceSubTypeID,
  failedToFetchServiceSubTypeID,
  fetchedSuccessfullyByUserID,
  requestedServiceSubTypeWithID,
  serviceSubTypeID,
} from '../common/serviceSubTypeMessage';
import { GetByServiceSubTypeIdService } from '../services/getByServiceSubTypeIdService';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/getServiceSubTypeById/:id')
export class GetByServiceSubTypeByIdController {
  constructor(
    private readonly getByServiceSubTypeIdService: GetByServiceSubTypeIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getServiceSubTypeById(@Param('id') id: number, @Req() req, @Res() res) {
    const userId = req.user.id;
    this.logger.doLog(
      `User ID: ${userId} ${requestedServiceSubTypeWithID} ${id}`,
      'info',
    );

    try {
      const response =
        await this.getByServiceSubTypeIdService.getServiceSubTypeById(id);

      if (response.status) {
        this.logger.doLog(
          `${serviceSubTypeID} ${id} ${fetchedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return res.status(200).send({
          status: true,
          message: response.message,
          result: response.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchServiceSubTypeID} ${id} — Reason: ${response.message}`,
          'warn',
        );
        return res.status(404).send({
          status: false,
          message: response.message,
          error: response.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingServiceSubTypeID} ${id} ${byUserID} ${userId} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileRetrievingServiceSubType,
        error: error.message,
      });
    }
  }
}

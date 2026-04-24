import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllServiceSubTypeService } from '../services/gatAllServiceSubTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  allServiceSubTypesFetchedSuccessfullyByUserID,
  anErrorOccurredWhileRetrievingServiceSubType,
  errorOccurredWhileFetchingAllServiceSubFypesForUserID,
  failedToFetchAllServiceSubTypesReason,
  requestedAllServiceSubTypes,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/getAllServiceSubTypes')
export class GetAllServiceSubTypeController {
  constructor(
    private readonly getAllServiceSubTypeService: GetAllServiceSubTypeService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async GetAllServiceSubType(@Res() res, @Req() req) {
    const userId = req.user.id;
    this.logger.doLog(
      `User ID: ${userId} ${requestedAllServiceSubTypes}`,
      'info',
    );

    try {
      const serviceSubTypeResponse =
        await this.getAllServiceSubTypeService.getAllServiceSubType();

      if (serviceSubTypeResponse.status === true) {
        this.logger.doLog(
          `${allServiceSubTypesFetchedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return res.status(200).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          result: serviceSubTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchAllServiceSubTypesReason} ${serviceSubTypeResponse.message}`,
          'warn',
        );
        return res.status(400).send({
          status: false,
          message: serviceSubTypeResponse.message,
          error: serviceSubTypeResponse.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileFetchingAllServiceSubFypesForUserID} ${userId} — ${error.message}`,
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

import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountServiceTypeService } from '../services/getAllAmountServiceTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  errorFetchingTotalAmountForServiceId,
  failedToFetchTotalAmountForServiceId,
  requestedByUserId,
  requestReceivedGetTotalAmountForServiceId,
  serviceTypeRetrievalError,
  totalAmountFetchedSuccessfullyForServiceId,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getTotalAmountServiceType/:serviceId')
export class GetTotalAmountServiceTypeController {
  constructor(
    private readonly getTotalAmountServiceTypeService: GetTotalAmountServiceTypeService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getServiceTypeById(
    @Param('serviceId') serviceId: number,
    @Res() res,
    @Req() req,
  ) {
    const userId = req.user.id;

    this.logger.doLog(
      `${requestReceivedGetTotalAmountForServiceId} ${serviceId}, ${requestedByUserId} ${userId}`,
      'success',
    );

    try {
      const serviceTypeResponse =
        await this.getTotalAmountServiceTypeService.getTotalAmountServiceType(
          serviceId,
        );

      if (serviceTypeResponse.status === true) {
        this.logger.doLog(
          `${totalAmountFetchedSuccessfullyForServiceId} ${serviceId}, ${requestedByUserId} ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: serviceTypeResponse.message,
          data: serviceTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchTotalAmountForServiceId} ${serviceId}, ${requestedByUserId} ${userId}. Reason: ${serviceTypeResponse.message}`,
          'fail',
        );

        return res.status(404).send({
          status: false,
          message: serviceTypeResponse.message,
          error: serviceTypeResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingTotalAmountForServiceId} ${serviceId}, ${requestedByUserId} ${userId}. Error: ${error.message}`,
        'fail',
      );

      return res.status(500).send({
        status: false,
        message: serviceTypeRetrievalError,
        error: error.message,
      });
    }
  }
}

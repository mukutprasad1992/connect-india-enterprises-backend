import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountsAndServicesByUserIdServiceTypeService } from '../services/getTotalAmountsAndServicesByUserIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  errorFetchingTotalAmountServicesForUserId,
  failedToFetchTotalAmountServicesForUserId,
  fetchedTotalAmountServicesSuccessfullyForUserId,
  requestReceivedGetTotalAmountServicesByUserId,
  serviceTypeRetrievalError,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getTotalAmountAndServiecsByUserIdServiceType')
export class GetTotalAmountAndServicesByUserIdServiceTypeController {
  constructor(
    private readonly getTotalAmountsAndServicesByUserIdServiceTypeService: GetTotalAmountsAndServicesByUserIdServiceTypeService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTotalAmountByUserId(@Res() res, @Req() req) {
    const userId = req.user.id;

    this.logger.doLog(
      `${requestReceivedGetTotalAmountServicesByUserId} ${userId}`,
      'success',
    );

    try {
      const serviceTypeResponse =
        await this.getTotalAmountsAndServicesByUserIdServiceTypeService.getTotalAmountServiceTypeById(
          userId,
        );

      if (serviceTypeResponse.status) {
        this.logger.doLog(
          `${fetchedTotalAmountServicesSuccessfullyForUserId} ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: serviceTypeResponse.message,
          data: serviceTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchTotalAmountServicesForUserId} ${userId}. Reason: ${serviceTypeResponse.message}`,
          'fail',
        );

        return res.status(400).send({
          status: false,
          message: serviceTypeResponse.message,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingTotalAmountServicesForUserId} ${userId}. Error: ${error.message}`,
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

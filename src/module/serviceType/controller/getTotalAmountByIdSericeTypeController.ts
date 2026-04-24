import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountByUserIdServiceTypeService } from '../services/getTotalAmountByServiseTypeIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  errorFetchingTotalAmountForServiceTypeId,
  failedToFetchTotalAmountForServiceTypeId,
  requestedByUserId,
  requestReceivedGetTotalAmountForServiceTypeId,
  serviceTypeRetrievalError,
  totalAmountFetchedSuccessfullyForServiceTypeId,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getTotalAmountByUserIdServiceTypeById/:id')
export class GetTotalAmountByUserIdServiceTypeController {
  constructor(
    private readonly getTotalAmountByUserIdServiceTypeService: GetTotalAmountByUserIdServiceTypeService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getServiceTypeById(@Param('id') id: number, @Res() res, @Req() req) {
    const userId = req.user.id;

    this.logger.doLog(
      `${requestReceivedGetTotalAmountForServiceTypeId} ${id}, ${requestedByUserId} ${userId}`,
      'success',
    );

    try {
      const serviceTypeResponse =
        await this.getTotalAmountByUserIdServiceTypeService.getTotalAmountServiceTypeById(
          userId,
          id,
        );

      if (serviceTypeResponse.status === true) {
        this.logger.doLog(
          `${totalAmountFetchedSuccessfullyForServiceTypeId} ${id}, ${requestedByUserId} ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: serviceTypeResponse.message,
          data: serviceTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchTotalAmountForServiceTypeId} ${id}, ${requestedByUserId}  ${userId}. Reason: ${serviceTypeResponse.message}`,
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
        `${errorFetchingTotalAmountForServiceTypeId} ${id}, ${requestedByUserId} ${userId}. Error: ${error.message}`,
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

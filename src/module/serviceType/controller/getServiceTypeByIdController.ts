import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetServiceTypeByIdService } from '../services/getServiceTypeByIdServise';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  errorFetchingServiceTypeId,
  failedToFetchServiceTypeId,
  forServiceTypeId,
  requestedByUserId,
  requestReceivedGetServiceTypeById,
  serviceTypeRetrievalError,
  serviceTypeRetrievedSuccessfully,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/getServiceTypeById/:id')
export class GetServiceTypeByIdController {
  constructor(
    private readonly getServiceTypeByIdService: GetServiceTypeByIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getServiceTypeById(@Param('id') id: number, @Res() res, @Req() req) {
    const userId = req.user.id;

    this.logger.doLog(
      `${requestReceivedGetServiceTypeById} ${id}, ${requestedByUserId} ${userId}`,
      'success',
    );

    try {
      const serviceTypeResponse =
        await this.getServiceTypeByIdService.getServiceTypeById(id);

      if (serviceTypeResponse.status === true) {
        this.logger.doLog(
          `${serviceTypeRetrievedSuccessfully} ${forServiceTypeId} ${id}, ${requestedByUserId} ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: serviceTypeResponse.message,
          data: serviceTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchServiceTypeId} ${id}, ${requestedByUserId} ${userId}. Reason: ${serviceTypeResponse.message}`,
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
        `${errorFetchingServiceTypeId} ${id},${requestedByUserId} ${userId}. Error: ${error.message}`,
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

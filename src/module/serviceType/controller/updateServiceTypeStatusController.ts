import {
  Controller,
  Put,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UpdateServiceTypeStatusService } from '../services/updateServiseTypeStatusService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import {
  byUserId,
  errorWhileUpdatingServiceTypeStatusServiceTypeId,
  failedToUpdateServiceTypeStatusServiceTypeId,
  requestReceivedUpdateStatusOfServiceTypeId,
  serviceTypeStatusUpdatedSuccessfullyServiceTypeId,
  serviceTypeUpdatedSuccessfully,
  serviceTypeUpdateError,
} from '../common/serviceTypeMessage';
import { UpdateStatusServiceTypeDTO } from '../serviceTypeDTO/updateStatusInvestmentDTO';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/updateStatus/:id/:serviceId')
export class UpdateServiceTypeStatusController {
  constructor(
    private readonly updateServiceTypeStatusService: UpdateServiceTypeStatusService,
    private readonly logger: AppLogger, // ✅ Inject logger
  ) {}

  @UseGuards(AuthGuard)
  @Put()
  async updateServiceTypeStatus(
    @Param('id') id: number,
    @Param('serviceId') serviceId: number,
    @Body(
      new ValidationServiceType(
        UpdateStatusServiceTypeDTO.getValidationSchema(),
      ),
    )
    updateStatusServiceTypeDTO: UpdateStatusServiceTypeDTO,
    @Res() res,
    @Req() req,
  ) {
    const userId = req.user.id;

    this.logger.doLog(
      `${requestReceivedUpdateStatusOfServiceTypeId} ${id} (serviceId: ${serviceId}) ${byUserId} ${userId}`,
      'success',
    );

    try {
      const updateResponse =
        await this.updateServiceTypeStatusService.updateServiceTypeStatus(
          id,
          updateStatusServiceTypeDTO,
          userId,
          serviceId,
        );

      if (updateResponse.status === true) {
        this.logger.doLog(
          `${serviceTypeStatusUpdatedSuccessfullyServiceTypeId} ${id}, serviceId: ${serviceId}, userId: ${userId}`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: serviceTypeUpdatedSuccessfully,
          data: updateResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateServiceTypeStatusServiceTypeId} ${id}, serviceId: ${serviceId}, userId: ${userId}. Reason: ${updateResponse.message}`,
          'fail',
        );

        return res.status(400).send({
          status: false,
          message: updateResponse.message,
          error: updateResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileUpdatingServiceTypeStatusServiceTypeId} ${id}, serviceId: ${serviceId}, userId: ${userId}. Error: ${error.message}`,
        'fail',
      );

      return res.status(500).send({
        status: false,
        message: serviceTypeUpdateError,
        error: error.message,
      });
    }
  }
}

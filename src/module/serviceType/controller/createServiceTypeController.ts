import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { CreateServiceTypeService } from '../services/createServiceTypeServices';
import { CreateServiceTypeDTO } from '../serviceTypeDTO/createServiceTypeDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import {
  errorWhileCreatingServiceTypeForUserID,
  failedToCreateServiceTypeForUserID,
  requestReceivedToCreateServiceTypeByUserID,
  serviceTypeCreatedSuccessfully,
  serviceTypeCreationError,
  serviceTypeID,
  serviceTypeCreationCompletedSuccessfullyForUserId,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/createServiceType')
export class CreateServiceTypeController {
  constructor(
    private readonly createServiceTypeService: CreateServiceTypeService,
    private readonly logger: AppLogger, // 👈 inject custom logger
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createServiceType(
    @Body(new ValidationServiceType(CreateServiceTypeDTO.getValidationSchema()))
    createServiceTypeDto: CreateServiceTypeDTO,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    this.logger.doLog(
      `${requestReceivedToCreateServiceTypeByUserID} ${userId}`,
      'success',
    );
    this.logger.doLog(
      `Payload: ${JSON.stringify(createServiceTypeDto)}`,
      'success',
    );

    try {
      const serviceTypeSchemaResponse =
        await this.createServiceTypeService.createServiceType(
          userId,
          createServiceTypeDto,
        );

      if (serviceTypeSchemaResponse.status === true) {
        this.logger.doLog(
          `${serviceTypeCreationCompletedSuccessfullyForUserId} ${userId}, ${serviceTypeID} ${serviceTypeSchemaResponse.data?.id}`,
          'success',
        );

        return res.status(201).send({
          status: true,
          message:
            serviceTypeSchemaResponse.message || serviceTypeCreatedSuccessfully,
          data: serviceTypeSchemaResponse.data,
          notification: serviceTypeSchemaResponse.notification,
        });
      } else {
        this.logger.doLog(
          `${failedToCreateServiceTypeForUserID} ${userId}. Reason: ${serviceTypeSchemaResponse.message}`,
          'fail',
        );

        return res.status(400).send({
          status: false,
          message: serviceTypeSchemaResponse.message,
          error: serviceTypeSchemaResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileCreatingServiceTypeForUserID} ${userId}. Error: ${error.message}`,
        'fail',
      );

      return res.status(500).send({
        status: false,
        message: serviceTypeCreationError,
        error: error.message,
      });
    }
  }
}

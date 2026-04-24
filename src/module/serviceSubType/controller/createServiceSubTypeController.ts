import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { ServiceSubTypeDTO } from '../serviceSubTypeDTO/createServiceSubTypeDTO';
import { CreateServiceSubTypeService } from '../services/createServiceSubTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceSubType } from '../common/joiServiceSubType';
import {
  anErrorOccurredWhileCreatingTheServiceSubType,
  errorCreatingServiceSubTypeByUserID,
  failedToCreateServiceSubTypeByUserID,
  initiatedServiceSubTypeCreation,
  serviceSubTypeCreatedSuccessfullyByUserID,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/createServiceSubType')
export class CreateServiceSubTypeController {
  constructor(
    private readonly createServiceSubTypeService: CreateServiceSubTypeService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createServiceSubType(
    @Body(new ValidationServiceSubType(ServiceSubTypeDTO.ServiceSubTypeSchema))
    serviceSubTypeDTO: ServiceSubTypeDTO,
    @Res() res,
    @Req() req,
  ) {
    const userId = req.user.id;
    this.logger.doLog(
      `User ID: ${userId} ${initiatedServiceSubTypeCreation}`,
      'info',
    );

    try {
      const serviceSubTypeResponse =
        await this.createServiceSubTypeService.createServiceSubType(
          serviceSubTypeDTO,
          userId,
        );

      if (serviceSubTypeResponse.status === true) {
        this.logger.doLog(
          `${serviceSubTypeCreatedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return res.status(201).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          result: serviceSubTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToCreateServiceSubTypeByUserID} ${userId} — Reason: ${serviceSubTypeResponse.message}`,
          'warn',
        );
        return res.status(400).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          error: serviceSubTypeResponse.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorCreatingServiceSubTypeByUserID} ${userId} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileCreatingTheServiceSubType,
        error: error.message,
      });
    }
  }
}

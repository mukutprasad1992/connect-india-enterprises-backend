import {
  Controller,
  Put,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UpdateServiceSubTypeByIdService } from '../services/updateServiceSubTypeBYIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { ValidationServiceSubType } from '../common/joiServiceSubType';
import {
  anErrorOccurredWhileUpdatingServiceSubType,
  byUserID,
  errorUpdatingServiceSubTypeID,
  failedToUpdateServiceSubTypeID,
  initiatedUpdateForServiceSubTypeID,
  serviceSubTypeID,
  updatedSuccessfullyByUserID,
} from '../common/serviceSubTypeMessage';
import { UpdateServiceSubTypeDTO } from '../serviceSubTypeDTO/updateServiceSubTypeDTO';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceSubType/updateServiceSubTypeById/:id')
export class UpdateServiceSubTypeByIdController {
  constructor(
    private readonly updateServiceSubTypeByIdService: UpdateServiceSubTypeByIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Put()
  async updateServiceSubTypeByIdController(
    @Param('id') id: number,
    @Body(
      new ValidationServiceSubType(
        UpdateServiceSubTypeDTO.ServiceSubTypeSchema,
      ),
    )
    updateServiceSubTypeDTO: UpdateServiceSubTypeDTO,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    this.logger.doLog(
      `User ID: ${userId} ${initiatedUpdateForServiceSubTypeID} ${id}`,
      'info',
    );

    try {
      const serviceSubTypeResponse =
        await this.updateServiceSubTypeByIdService.updateServiceSubType(
          id,
          updateServiceSubTypeDTO,
          userId,
        );

      if (serviceSubTypeResponse.status === true) {
        this.logger.doLog(
          `${serviceSubTypeID} ${id} ${updatedSuccessfullyByUserID} ${userId}`,
          'success',
        );
        return res.status(200).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          result: serviceSubTypeResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateServiceSubTypeID} ${id} — Reason: ${serviceSubTypeResponse.message}`,
          'warn',
        );
        return res.status(404).send({
          status: serviceSubTypeResponse.status,
          message: serviceSubTypeResponse.message,
          error: serviceSubTypeResponse.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorUpdatingServiceSubTypeID} ${id} ${byUserID} ${userId} — ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileUpdatingServiceSubType,
        error: error.message,
      });
    }
  }
}

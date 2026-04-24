import {
  Controller,
  Put,
  Param,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UpdateServiceByIdService } from '../services/updateServiceByIdServices';
import { UpdateServiceDTO } from '../serviceDTO/updateServiceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationService } from '../common/joiValidationService';
import {
  serviceUpdatedSuccessfully,
  serviceUpdateError,
} from '../common/serviceMessage';

@Controller('service/updateServiceById/:id')
export class UpdateServiceByIdController {
  constructor(
    private readonly updateServiceByIdService: UpdateServiceByIdService,
  ) {}

  @UseGuards(AuthGuard)
  @Put()
  async updateServiceById(
    @Param('id') id: number,
    @Body(new ValidationService(UpdateServiceDTO.serviceSchema))
    updateServiceDTO: UpdateServiceDTO,
    @Res() res,
    @Req() req,
  ) {
    try {
      const userId = req.user.id;
      const updateResponse =
        await this.updateServiceByIdService.updateServiceById(
          id,
          userId,
          updateServiceDTO,
        );

      if (updateResponse.status === true) {
        return res.status(200).send({
          status: true,
          message: serviceUpdatedSuccessfully,
          data: updateResponse.data,
        });
      } else {
        return res.status(400).send({
          status: false,
          message: updateResponse.message,
          error: updateResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      return res.status(500).send({
        status: false,
        message: serviceUpdateError,
        error: error.message,
      });
    }
  }
}

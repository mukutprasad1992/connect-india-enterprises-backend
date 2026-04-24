import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetServiceByIdService } from '../services/getServiceByIdServise';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  serviceRetrievalError,
  serviceRetrievedSuccessfully,
} from '../common/serviceMessage';

@Controller('service/getServiceById/:id')
export class GetServiceByIdController {
  constructor(private readonly getServiceByIdService: GetServiceByIdService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getServiceById(@Param('id') id: number, @Res() res, @Req() req) {
    try {
      const serviceResponse =
        await this.getServiceByIdService.getServiceById(id);

      if (serviceResponse.status === true) {
        return res.status(200).send({
          status: true,
          message: serviceResponse.message,
          data: serviceResponse.data,
        });
      } else {
        return res.status(404).send({
          status: false,
          message: serviceResponse.message,
          error: serviceResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      return res.status(500).send({
        status: false,
        message: serviceRetrievalError,
        error: error.message,
      });
    }
  }
}

import { Controller, Res, UseGuards, Req, Get } from '@nestjs/common';
import { GetALLServiceByIdmentService } from '../services/getAllServiceServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { serviceRetrievalError } from '../common/serviceMessage';
@Controller('service/getAllService')
export class GetAllServicesController {
  constructor(
    private readonly getALLServiceByIdmentService: GetALLServiceByIdmentService,
  ) {}
  @UseGuards(AuthGuard)
  @Get()
  async getUserServices(@Res() res, @Req() req) {
    try {
      const userId = req.user.id;
      const servicesResponse =
        await this.getALLServiceByIdmentService.getAllServicesByUser();

      if (servicesResponse.status === true) {
        return res.status(200).send({
          status: true,
          message: servicesResponse.message,
          data: servicesResponse.data,
        });
      } else {
        return res.status(400).send({
          status: false,
          message: servicesResponse.error,
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

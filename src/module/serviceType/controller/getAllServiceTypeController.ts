import { Controller, Res, UseGuards, Req, Get } from '@nestjs/common';
import { GetALLServiceTypeByIdService } from '../services/getAllServiceTypeServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceTypeRetrievalError
} from '../common/serviceTypeMessage';
@Controller('serviceType/getAllServiceType')
export class GetAllServiceTypesController {
    constructor(private readonly getALLServiceTypeByIdService: GetALLServiceTypeByIdService) { }
    @UseGuards(AuthGuard)
    @Get()
    async getUserServiceTypes(@Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            const serviceTypesResponse = await this.getALLServiceTypeByIdService.getAllServiceTypesByUser();

            if (serviceTypesResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: serviceTypesResponse.message,
                    data: serviceTypesResponse.data
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: serviceTypesResponse.error,
                    data: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message
            });
        }
    }
}
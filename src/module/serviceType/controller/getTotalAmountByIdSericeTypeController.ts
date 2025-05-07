import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountByUserIdServiceTypeService } from '../services/getTotalAmountByServiseTypeIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceTypeRetrievalError,
} from '../common/serviceTypeMessage';

@Controller('serviceType/getTotalAmountByUserIdServiceTypeById/:id')
export class GetTotalAmountByUserIdServiceTypeController {
    constructor(private readonly getTotalAmountByUserIdServiceTypeService: GetTotalAmountByUserIdServiceTypeService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceTypeById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceTypeResponse = await this.getTotalAmountByUserIdServiceTypeService.getTotalAmountServiceTypeById(userId, id);
            if (serviceTypeResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: serviceTypeResponse.message,
                    data: serviceTypeResponse.data,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: serviceTypeResponse.message,
                    error: serviceTypeResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceTypeRetrievalError,
                error: error.message,
            });
        }
    }
}

import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetTotalAmountsAndServicesByUserIdServiceTypeService } from '../services/getTotalAmountsAndServicesByUserIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { UserSchema } from '../../user/userEntity/userSchema';
import {
    serviceTypeRetrievalError,
} from '../common/serviceTypeMessage';

@Controller('serviceType/getTotalAmountAndServiecsByUserIdServiceType')
export class GetTotalAmountAndServicesByUserIdServiceTypeController {
    constructor(
        private readonly getTotalAmountsAndServicesByUserIdServiceTypeService: GetTotalAmountsAndServicesByUserIdServiceTypeService,
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getTotalAmountByUserId(
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;

            const serviceTypeResponse = await this.getTotalAmountsAndServicesByUserIdServiceTypeService.getTotalAmountServiceTypeById(userId);

            if (serviceTypeResponse.status) {
                return res.status(200).send({
                    status: true,
                    message: serviceTypeResponse.message,
                    data: serviceTypeResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: serviceTypeResponse.message,
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

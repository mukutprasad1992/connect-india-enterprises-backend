import { Controller, Delete, Param, Res, UseGuards, Req } from '@nestjs/common';
import { DeleteServiceTypeByIdService } from '../services/deleteServiceTypeByIdServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';

import {
    serviceTypeDeletionError,
    serviceTypeDeletedSuccessfully,
} from '../common/serviceTypeMessage';

@Controller('serviceType/deleteServiceTypeById/:id')
export class DeleteServiceTypeByIdController {
    constructor(
        private readonly deleteServiceTypeByIdService: DeleteServiceTypeByIdService,
    ) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteServiceTypeById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const deleteResponse = await this.deleteServiceTypeByIdService.deleteServiceTypeById(id, userId);
            if (deleteResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: deleteResponse.message,
                    data: null,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: deleteResponse.message,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceTypeDeletionError,
                error: error.message,
            });
        }
    }
}

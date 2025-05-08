import { Controller, Delete, Param, Res, UseGuards, Req } from '@nestjs/common';
import { DeleteServiceByIdService } from '../services/deleteServiceByIdServices';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    serviceDeletionError,
    serviceDeletedSuccessfully,
} from '../common/serviceMessage';

@Controller('service/deleteServiceById/:id')
export class DeleteServiceByIdController {
    constructor(private readonly deleteServiceByIdService: DeleteServiceByIdService) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteServiceById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const deleteResponse = await this.deleteServiceByIdService.deleteServiceById(id);

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
                message: serviceDeletionError,
                error: error.message,
            });
        }
    }
}

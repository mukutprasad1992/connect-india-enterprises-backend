import { Controller, Delete, Param, Res, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { DeleteInsuranceByIdService } from '../service/deleteInsuranceByIdService';
import { insuranceDeletionError } from '../common/insuranceMessage';
@Controller('insurance/deleteInsuranceById/:id')
export class DeleteInsuranceByIdController {
    constructor(
        private readonly deleteInsuranceByIdService: DeleteInsuranceByIdService,
    ) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteInsuranceById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const deleteResponse = await this.deleteInsuranceByIdService.deleteInsuranceById(id, userId);
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
                message: insuranceDeletionError,
                error: error.message,
            });
        }
    }
}

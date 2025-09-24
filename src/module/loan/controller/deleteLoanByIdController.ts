import { Controller, Delete, Param, Res, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { DeleteLoanByIdService } from '../services/deleteLoanByIdService';
import { loanDeletionError } from '../common/loanMessage';
@Controller('loan/deleteLoanById/:id')
export class DeleteLoanByIdController {
    constructor(
        private readonly deleteLoanByIdService: DeleteLoanByIdService,
    ) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteLoanById(
        @Param('id') id: number,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const deleteResponse = await this.deleteLoanByIdService.deleteLoanById(id, userId);
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
                message: loanDeletionError,
                error: error.message,
            });
        }
    }
}

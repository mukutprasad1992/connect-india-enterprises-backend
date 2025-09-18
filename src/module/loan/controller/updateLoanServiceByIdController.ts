import { Controller, Put, Param, Body, Res, UseGuards, Req, UsePipes } from '@nestjs/common';
import { UpdateLoanByIdService } from '../services/updateLoanByIdService';
import { UpdateLoanDTO } from '../loanDTO/updateLoanDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationLoan } from '../common/joiValidationLoan';
import { loanUpdateError } from '../common/loanMessage';


@Controller('loan/updateLoanById/:id')
export class UpdateLoanByIdController {
    constructor(private readonly updateLoanByIdService: UpdateLoanByIdService) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateLoanById(
        @Param('id') id: number,
        @Body(new ValidationLoan(UpdateLoanDTO.getValidationSchema())) updateLoanDTO: UpdateLoanDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const updateResponse = await this.updateLoanByIdService.updateLoanById(id, userId, updateLoanDTO);

            if (updateResponse.status === true) {
                return res.status(200).send({
                    status: updateResponse.status,
                    message: updateResponse.message,
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
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: loanUpdateError,
                error: error.message,
            });
        }
    }
}

import { Controller, Post, Body, Res, UseGuards, Req, Get, UsePipes } from '@nestjs/common';
import { CreateLoanDTO } from '../loanDTO/createLoanDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationLoan } from '../common/joiValidationLoan';
import { CreateLoanService } from '../services/createLoanService';
import { loanCreationError } from '../common/loanMessage';

@Controller('loan/createLoan')
export class CreateLoanController {
    constructor(private readonly createLoanService: CreateLoanService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createLoan(
        @Body(new ValidationLoan(CreateLoanDTO.getValidationSchema())) createLoanDTO: CreateLoanDTO,
        @Req() req, @Res() res
    ) {
        try {
            const userId = req.user.id;
            const loanResponse = await this.createLoanService.createLoan(userId, createLoanDTO);

            if (loanResponse.status === true) {
                return res.status(201).send({
                    status: true,
                    message: loanResponse.message,
                    data: loanResponse.data,
                    notification: loanResponse.notification
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: loanResponse.message,
                    error: loanResponse.error,
                    data: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: loanCreationError,
                error: error.message
            });
        }
    }
}

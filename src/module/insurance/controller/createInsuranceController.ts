import { Controller, Post, Body, Res, UseGuards, Req, Get, UsePipes } from '@nestjs/common';
import { CreateInsuranceDTO } from '../insuranceDTO/createInsuranceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationInsurance } from '../common/joiValidationInsurance';
import { CreateInsuranceService } from '../service/createInsuranceService';
import { insuranceCreationError } from '../common/insuranceMessage';

@Controller('insurance/createInsurance')
export class CreateInsuranceController {
    constructor(private readonly createInsuranceService: CreateInsuranceService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createInsurance(
        @Body(new ValidationInsurance(CreateInsuranceDTO.getValidationSchema())) createInsuranceDTO: CreateInsuranceDTO,
        @Req() req, @Res() res
    ) {
        try {
            const userId = req.user.id;
            const insuranceResponse = await this.createInsuranceService.createInsurance(userId, createInsuranceDTO);

            if (insuranceResponse.status === true) {
                return res.status(201).send({
                    status: true,
                    message: insuranceResponse.message,
                    data: insuranceResponse.data,
                    notification: insuranceResponse.notification
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: insuranceResponse.message,
                    error: insuranceResponse.error,
                    data: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: insuranceCreationError,
                error: error.message
            });
        }
    }
}

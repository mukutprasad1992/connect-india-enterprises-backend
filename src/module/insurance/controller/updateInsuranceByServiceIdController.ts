import { Controller, Put, Param, Body, Res, UseGuards, Req, UsePipes } from '@nestjs/common';
import { UpdateInsuranceByIdService } from '../service/updateInsuranceService';
import { UpdateInsuranceDTO } from '../insuranceDTO/updateInsuranceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationInsurance } from '../common/joiValidationInsurance';
import { insuranceUpdateError } from '../common/insuranceMessage';


@Controller('insurance/updateInsuranceById/:id')
export class UpdateInsuranceByIdController {
    constructor(private readonly updateInsuranceByIdService: UpdateInsuranceByIdService) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateLoanById(
        @Param('id') id: number,
        @Body(new ValidationInsurance(UpdateInsuranceDTO.getValidationSchema())) updateInsuranceDTO: UpdateInsuranceDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const updateResponse = await this.updateInsuranceByIdService.updateInsurnaceById(id, userId, updateInsuranceDTO);

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
                message: insuranceUpdateError,
                error: error.message,
            });
        }
    }
}

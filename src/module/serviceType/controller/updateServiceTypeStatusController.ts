import { Controller, Put, Body, Param, Res, UseGuards, Req, UsePipes } from '@nestjs/common';
import { UpdateServiceTypeStatusService } from '../services/updateServiseTypeStatusService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import { serviceTypeUpdatedSuccessfully, serviceTypeUpdateError } from '../common/serviceTypeMessage';
import { UpdateStatusServiceTypeDTO } from '../serviceTypeDTO/updateStatusInvestmentDTO';

@Controller('serviceType/updateStatus/:id')
export class UpdateServiceTypeStatusController {
    constructor(
        private readonly updateServiceTypeStatusService: UpdateServiceTypeStatusService,
    ) { }
    @UseGuards(AuthGuard)
    @Put()
    async updateServiceTypeStatus(
        @Param('id') id: number,
        @Body(new ValidationServiceType(UpdateStatusServiceTypeDTO.getValidationSchema())) updateStatusServiceTypeDTO: UpdateStatusServiceTypeDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const { status } = updateStatusServiceTypeDTO;
            const updateResponse = await this.updateServiceTypeStatusService.updateServiceTypeStatus(id, updateStatusServiceTypeDTO, userId);

            if (updateResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: serviceTypeUpdatedSuccessfully,
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
                message: serviceTypeUpdateError,
                error: error.message,
            });
        }
    }
}

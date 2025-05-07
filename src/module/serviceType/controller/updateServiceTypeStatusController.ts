import { Controller, Put, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { UpdateServiceTypeStatusService } from '../services/updateServiseTypeStatusService';
import { UpdateServiceTypeDTO } from '../serviceTypeDTO/updateServiceTypeDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import { serviceTypeUpdatedSuccessfully, serviceTypeUpdateError } from '../common/serviceTypeMessage';

@Controller('serviceType/updateStatus/:id')
export class UpdateServiceTypeStatusController {
    constructor(
        private readonly updateServiceTypeStatusService: UpdateServiceTypeStatusService,
    ) { }
    @UseGuards(AuthGuard)
    @Put()
    async updateServiceTypeStatus(
        @Param('id') id: number,
        @Body(new ValidationServiceType(UpdateServiceTypeDTO.serviceTypeSchema)) updateServiceTypeDto: UpdateServiceTypeDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const { status } = updateServiceTypeDto;
            const updateResponse = await this.updateServiceTypeStatusService.updateServiceTypeStatus(id, updateServiceTypeDto, userId);

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
            console.log("<-----error---->", error.message);
            return res.status(500).send({
                status: false,
                message: serviceTypeUpdateError,
                error: error.message,
            });
        }
    }
}

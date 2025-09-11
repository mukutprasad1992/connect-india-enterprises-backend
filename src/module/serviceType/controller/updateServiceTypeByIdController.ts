import { Controller, Put, Param, Body, Res, UseGuards, Req, UsePipes } from '@nestjs/common';
import { UpdateServiceTypeByIdService } from '../services/updateServiceTypeByIdServices';
import { UpdateServiceTypeDTO } from '../serviceTypeDTO/updateServiceTypeDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import {
    serviceTypeUpdatedSuccessfully,
    serviceTypeUpdateError,
} from '../common/serviceTypeMessage';

@Controller('serviceType/updateServiceTypeById/:id')
export class UpdateServiceTypeByIdController {
    constructor(private readonly updateServiceTypeByIdService: UpdateServiceTypeByIdService) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateServiceTypeById(
        @Param('id') id: number,
        @Body(new ValidationServiceType(UpdateServiceTypeDTO.getValidationSchema())) updateServiceTypeDto: UpdateServiceTypeDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const updateResponse = await this.updateServiceTypeByIdService.updateServiceTypeById(id, userId, updateServiceTypeDto);

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
                message: serviceTypeUpdateError,
                error: error.message,
            });
        }
    }
}

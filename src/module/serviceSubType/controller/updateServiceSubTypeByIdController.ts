import { Controller, Put, Param, Body, Req, Res, UseGuards } from '@nestjs/common';
import { UpdateServiceSubTypeByIdService } from '../services/updateServiceSubTypeBYIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { ValidationServiceSubType } from '../common/joiServiceSubType';
import { anErrorOccurredWhileUpdatingServiceSubType } from '../common/serviceSubTypeMessage';
import { UpdateServiceSubTypeDTO } from '../serviceSubTypeDTO/updateServiceSubTypeDTO';

@Controller('serviceSubType/updateServiceSubTypeById/:id')
export class UpdateServiceSubTypeByIdController {
    constructor(private readonly updateServiceSubTypeByIdService: UpdateServiceSubTypeByIdService) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateServiceSubTypeByIdController(
        @Param('id') id: number,
        @Body(new ValidationServiceSubType(UpdateServiceSubTypeDTO.ServiceSubTypeSchema))
        updateServiceSubTypeDTO: UpdateServiceSubTypeDTO,
        @Req() req,
        @Res() res
    ) {
        try {
            const userId = req.user.id;
            const serviceSubTypeResponse = await this.updateServiceSubTypeByIdService.updateServiceSubType(id, updateServiceSubTypeDTO, userId);

            if (serviceSubTypeResponse.status === true) {
                return res.status(200).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data,
                });
            } else {
                return res.status(404).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    error: serviceSubTypeResponse.error,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileUpdatingServiceSubType,
                error: error.message,
            });
        }
    }
}

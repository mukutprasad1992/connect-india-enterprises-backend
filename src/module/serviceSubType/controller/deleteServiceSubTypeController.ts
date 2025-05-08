import { Controller, Delete, Res, UseGuards, Req, Param } from '@nestjs/common';
import { DeleteServiceSubTypeByIdService } from '../services/deleteServiceSubTypeService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { anErrorOccurredWhileDeletingServiceSubType } from '../common/serviceSubTypeMessage';

@Controller('serviceSubType/deleteServiceSubTypeById/:id')
export class DeleteServiceSubTypeByIdController {
    constructor(private readonly deleteServiceSubTypeByIdService: DeleteServiceSubTypeByIdService) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteServiceSubType(@Param('id') id: number, @Req() req, @Res() res) {
        try {
            const userId = req.user.id;
            const serviceSubTypeResponse = await this.deleteServiceSubTypeByIdService.deleteServiceSubTypeById(id);

            if (serviceSubTypeResponse.status === true) {
                return res.status(200).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data
                });
            } else {
                return res.status(404).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    error: serviceSubTypeResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileDeletingServiceSubType,
                error: error.message
            });
        }
    }
}

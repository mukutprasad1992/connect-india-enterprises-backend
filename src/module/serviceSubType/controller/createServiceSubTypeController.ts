import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { ServiceSubTypeDTO } from '../serviceSubTypeDTO/createServiceSubTypeDTO';
import { CreateServiceSubTypeService } from '../services/createServiceSubTypeService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceSubType } from '../common/joiServiceSubType';
import {
    anErrorOccurredWhileCreatingTheServiceSubType,
    createServiceSubTypeSuccessfully
} from '../common/serviceSubTypeMessage';

@Controller('serviceSubType/createServiceSubType')
export class CreateServiceSubTypeController {
    constructor(private readonly createServiceSubTypeService: CreateServiceSubTypeService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createServiceSubType(
        @Body(new ValidationServiceSubType(ServiceSubTypeDTO.ServiceSubTypeSchema)) serviceSubTypeDTO: ServiceSubTypeDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceSubTypeResponse = await this.createServiceSubTypeService.createServiceSubType(serviceSubTypeDTO, userId);
            if (serviceSubTypeResponse.status === true) {
                return res.status(201).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    result: serviceSubTypeResponse.data
                });
            } else {
                return res.status(400).send({
                    status: serviceSubTypeResponse.status,
                    message: serviceSubTypeResponse.message,
                    error: serviceSubTypeResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileCreatingTheServiceSubType,
                error: error.message
            });
        }
    }
}

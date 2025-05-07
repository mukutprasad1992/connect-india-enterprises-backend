import { Controller, Post, Body, Res, UseGuards, Req, Get } from '@nestjs/common';
import { CreateServiceTypeService } from '../services/createServiceTypeServices';
import { CreateServiceTypeDTO } from '../serviceTypeDTO/createServiceTypeDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import {
    serviceTypeCreatedSuccessfully,
    serviceTypeCreationError,
} from '../common/serviceTypeMessage';
@Controller('serviceType/createServiceType')
export class CreateServiceTypeController {
    constructor(private readonly createServiceTypeService: CreateServiceTypeService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createServiceType(
        @Body(new ValidationServiceType(CreateServiceTypeDTO.ServiceTypeSchema)) createServiceTypeDto: CreateServiceTypeDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceTypeSchemaResponse = await this.createServiceTypeService.createServiceType(userId, createServiceTypeDto);

            if (serviceTypeSchemaResponse.status === true) {
                return res.status(201).send({
                    status: true,
                    message: serviceTypeSchemaResponse.message,
                    data: serviceTypeSchemaResponse.data,
                    notification: serviceTypeSchemaResponse.notification
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: serviceTypeSchemaResponse.message,
                    error: serviceTypeSchemaResponse.error,
                    data: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceTypeCreationError,
                error: error.message
            });
        }
    }
}

import { Controller, Post, Body, Res, UseGuards, Req, Get } from '@nestjs/common';
import { CreateServiceService } from '../services/createServiceServices';
import { CreateServiceDTO } from '../serviceDTO/createServiceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationService } from '../common/joiValidationService';
import {
    serviceCreatedSuccessfully,
    serviceCreationError,
} from '../common/serviceMessage';
@Controller('service/createService')
export class CreateServiceController {
    constructor(private readonly createServiceService: CreateServiceService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createService(
        @Body(new ValidationService(CreateServiceDTO.ServiceSchema)) createServiceDTO: CreateServiceDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const serviceSchemaResponse = await this.createServiceService.createService(userId, createServiceDTO);

            if (serviceSchemaResponse.status === true) {
                return res.status(201).send({
                    status: true,
                    message: serviceSchemaResponse.message,
                    data: serviceSchemaResponse.data
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: serviceSchemaResponse.message,
                    error: serviceSchemaResponse.error,
                    data: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: serviceCreationError,
                error: error.message
            });
        }
    }
}

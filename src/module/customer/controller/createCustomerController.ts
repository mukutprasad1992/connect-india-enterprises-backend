import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { CreateCustomerService } from '../service/createCustomerService';
import { CreateCustomerDTO } from '../customerDTO/createCustomerDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { JoiValidationCustomer } from '../common/joiValidationCustomer';
import {
    customerCreatedSuccessfully,
    customerCreationError,
} from '../common/customerMessage';

@Controller('customers/createCustomer')
export class CreateCustomerController {
    constructor(private readonly createCustomerService: CreateCustomerService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createCustomer(
        @Body(new JoiValidationCustomer()) createCustomerDto: CreateCustomerDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const customerResponse = await this.createCustomerService.createCustomer(userId, createCustomerDto);
            if (customerResponse.status === true) {
                return res.status(201).send({
                    status: true,
                    message: customerResponse.message,
                    data: customerResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: customerResponse.message,
                    error: customerResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: customerCreationError,
                error: error.message,
            });
        }
    }
}

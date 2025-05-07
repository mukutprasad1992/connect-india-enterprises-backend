import { Controller, Post, Body, Res, UseGuards, Req, Put, Param } from '@nestjs/common';
import { UpdateCustomerService } from '../service/updateCustomerService';
import { UpdateCustomerDTO } from '../customerDTO/updateCustomerDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { JoiValidationCustomer } from '../common/joiValidationCustomer';
import {
    customerUpdationError,
} from '../common/customerMessage';

@Controller('customers/updateCustomer/:id')
export class UpdateCustomerController {
    constructor(private readonly updateCustomerService: UpdateCustomerService) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateCustomer(@Param('id') id: number,
        @Body(new JoiValidationCustomer()) updateCustomerDTO: UpdateCustomerDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const customerResponse = await this.updateCustomerService.updateCustomer(userId, id, updateCustomerDTO);
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
                message: customerUpdationError,
                error: error.message,
            });
        }
    }
}

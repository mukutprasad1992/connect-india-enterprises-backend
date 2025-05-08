import { Controller, Res, UseGuards, Req, Get, Param } from '@nestjs/common';
import { GetAllCustomersByVenderIdService } from '../service/getAllCustomerByVenderIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    customerNotFound,
    customersRetrievedSuccessfully
} from '../common/customerMessage';

@Controller('customer/getAllCustomerByVendorId/:id')
export class GetCustomerByVendorIdController {
    constructor(private readonly getAllCustomersByVenderIdService: GetAllCustomersByVenderIdService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getCustomerByVendorId(@Param('id') id: number, @Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            const customersResponse = await this.getAllCustomersByVenderIdService.getAllCustomersByVendorId(id);

            if (customersResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: customersRetrievedSuccessfully,
                    data: customersResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: customersResponse.message,
                    data: null,
                    error: customersResponse.error
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                error: error.message,
            });
        }
    }
}

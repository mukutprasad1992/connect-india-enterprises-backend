import { Controller, Res, UseGuards, Req, Get, Param } from '@nestjs/common';
import { GetAllCustomerService } from '../service/getAllCustomerService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    customersRetrievedSuccessfully
} from '../common/customerMessage';

@Controller('customer/getAllCustomer')
export class GetAllCustomerController {
    constructor(private readonly getAllCustomerService: GetAllCustomerService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getCustomerByVendor(@Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            const customersResponse = await this.getAllCustomerService.getAllCustomer(userId);

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

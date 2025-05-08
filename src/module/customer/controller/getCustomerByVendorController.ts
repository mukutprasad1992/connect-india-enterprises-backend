import { Controller, Res, UseGuards, Req, Get, Param } from '@nestjs/common';
import { GetAllCustomersByVenderService } from '../service/getCustomerByvedorService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    customerNotFound,
    customersRetrievedSuccessfully,
    vendorNotFound
} from '../common/customerMessage';

@Controller('customer/getCustomerByVendor')
export class GetCustomerByVendorController {
    constructor(private readonly getAllCustomersByVenderService: GetAllCustomersByVenderService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getCustomerByVendor(@Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).send({
                    status: false,
                    message: vendorNotFound,
                    data: null,
                });
            }
            const customersResponse = await this.getAllCustomersByVenderService.getAllCustomersByVendor(userId);

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

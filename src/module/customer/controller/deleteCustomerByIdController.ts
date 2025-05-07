import { Controller, Res, UseGuards, Req, Param, Delete } from '@nestjs/common';
import { DeleteCustomerByIdService } from '../service/deleteCustomerService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';

@Controller('customer/deleteCustomerById/:id')
export class DeleteCustomerByIdController {
    constructor(private readonly deleteCustomerByIdService: DeleteCustomerByIdService) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteCustomerByVendorId(@Param('id') id: number, @Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            const customersResponse = await this.deleteCustomerByIdService.deleteCustomerById(id);
            if (customersResponse.status === true) {
                return res.status(200).send({
                    status: true,
                    message: customersResponse.message,
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

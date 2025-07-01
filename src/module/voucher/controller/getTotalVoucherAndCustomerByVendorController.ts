import { Controller, Get, Param, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { GetTotalVoucherAndCustomerByVendorIdService } from '../service/getTotalVoucherAndCustomerByvendorIdService'
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/getVoucherAndCustomerById')
@UseGuards(AuthGuard)
export class GetTotalVoucherAndCustomerByVendorIdController {
    constructor(private readonly getTotalVoucherAndCustomerByVendorIdService: GetTotalVoucherAndCustomerByVendorIdService) { }

    @Get()
    async getVocherById(@Res() res, @Req() req) {
        try {
            const userId = req.user.id
            const voucherResponse = await this.getTotalVoucherAndCustomerByVendorIdService.getVoucherAndCustomerById(userId);
            if (voucherResponse.status === true) {
                return res.status(200).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data
                });
            } else {
                return res.status(401).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    error: voucherResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                error: error.message,
                data: null
            });
        }
    }
}

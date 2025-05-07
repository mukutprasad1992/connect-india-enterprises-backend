import { Controller, Get, Param, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { GetAllVouchersByVendorIdService } from '../service/getAllVoucherByVendorIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/getAllVoucherByVendor')
@UseGuards(AuthGuard)
export class GetAllVoucherByVendorIdController {
    constructor(private readonly getAllVouchersByVendorIdService: GetAllVouchersByVendorIdService) { }

    @Get()
    async getAllVouchersByVendor(@Res() res, @Req() req) {
        try {
            const vendorId = req.user.id;
            const voucherResponse = await this.getAllVouchersByVendorIdService.getAllVouchersByVendorId(vendorId);

            if (voucherResponse.status) {
                return res.status(200).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: 'Internal Server Error',
                error: error.message,
                result: null,
            });
        }
    }
}

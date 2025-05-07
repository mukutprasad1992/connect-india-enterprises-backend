import { Controller, Get, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { GetAllVoucherService } from '../service/getAllVocherService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/getAllVouchers')
@UseGuards(AuthGuard)
export class GetAllVoucherController {
    constructor(private readonly getAllVoucherService: GetAllVoucherService) { }

    @Get()
    async getAll(@Res() res, @Req() req) {
        try {
            const vouchersResponse = await this.getAllVoucherService.getAllVouchers();
            if (vouchersResponse.status === true) {
                return res.status(200).send({
                    status: vouchersResponse.status,
                    message: vouchersResponse.message,
                    result: vouchersResponse.data
                });
            } else {
                return res.status(401).send({
                    status: vouchersResponse.status,
                    message: vouchersResponse.message,
                    error: vouchersResponse.error,
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

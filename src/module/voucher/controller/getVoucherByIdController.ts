import { Controller, Get, Param, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { GetVoucherByIdService } from '../service/getVoucherByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/getVoucherById/:id')
@UseGuards(AuthGuard)
export class GetVoucherByIdController {
    constructor(private readonly getVoucherByIdService: GetVoucherByIdService) { }

    @Get()
    async getVocherById(@Param('id') id: number, @Res() res) {
        try {
            const voucherResponse = await this.getVoucherByIdService.getVoucherById(id);
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

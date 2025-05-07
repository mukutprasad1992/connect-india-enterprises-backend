import { Controller, Post, Body, Res, HttpStatus, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { CreateVoucherService } from '../service/createVoucherService';
import { CeateVoucherDTO } from '../voucherDTO/createVoucherDTO';
import { JoiValidationVoucher } from '../common/joiValidationVoucher';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/createVoucher')
@UseGuards(AuthGuard)
export class CreateVoucherController {
    constructor(private readonly createVoucherService: CreateVoucherService) { }
    @Post()
    async create(@Body(new JoiValidationVoucher())
    ceateVoucherDTO: CeateVoucherDTO,
        @Res() res, @Req() req) {
        try {
            const userId = req.user.id;
            const voucherResponse = await this.createVoucherService.createVoucher(userId, ceateVoucherDTO);
            if (voucherResponse.data && voucherResponse.status === true) {
                return res.status(201).send({
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
                message: error.message,
                error: error.message,
            });
        }
    }
}

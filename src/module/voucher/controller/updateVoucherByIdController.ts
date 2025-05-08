import { Controller, Put, Param, Res, HttpStatus, UseGuards, Req, Body } from '@nestjs/common';
import { UpdateVoucherService } from '../service/updateVoucherByIdService';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/updateVoucherById/:id')
@UseGuards(AuthGuard)
export class UpdateVoucherByIdController {
    constructor(private readonly updateVoucherService: UpdateVoucherService) { }

    @Put()
    async updateVoucherById(
        @Param('id') id: number,
        @Body() updateVoucherDTO: UpdateVoucherDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const voucherResponse = await this.updateVoucherService.updateVoucher(userId, id, updateVoucherDTO);

            if (voucherResponse.status) {
                return res.status(200).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: voucherResponse.message,
                    error: voucherResponse.error,
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

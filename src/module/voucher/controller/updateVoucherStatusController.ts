import { Controller, Put, Param, Res, HttpStatus, UseGuards, Req, Body } from '@nestjs/common';
import { UpdateVoucherStatusService } from '../service/updateStatusVoucherService';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/updateVoucherStatusById/:id')
@UseGuards(AuthGuard)
export class UpdateVoucherStatusByIdController {
    constructor(private readonly updateVoucherStatusService: UpdateVoucherStatusService) { }

    @Put()
    async updateVoucherById(
        @Param('id') id: number,
        @Body() updateVoucherDTO: UpdateVoucherDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const { status } = updateVoucherDTO;
            const voucherResponse = await this.updateVoucherStatusService.updateVoucherStatus(id, updateVoucherDTO, userId);

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

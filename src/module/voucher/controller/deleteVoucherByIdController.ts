import { Controller, Delete, Param, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { DeleteVoucherByIdService } from '../service/deleteVoucherByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('voucher/deleteVoucherById/:id')
@UseGuards(AuthGuard)
export class DeleteVoucherByIdController {
    constructor(private readonly deleteVoucherByIdService: DeleteVoucherByIdService) { }

    @Delete()
    async deleteVoucherById(@Param('id') id: number, @Res() res) {
        try {
            const deleteResponse = await this.deleteVoucherByIdService.deleteVoucherById(id);
            if (deleteResponse.status === true) {
                return res.status(200).send({
                    status: deleteResponse.status,
                    message: deleteResponse.message,
                    result: deleteResponse.data
                });
            } else {
                return res.status(400).send({
                    status: deleteResponse.status,
                    message: deleteResponse.message,
                    error: deleteResponse.error,
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

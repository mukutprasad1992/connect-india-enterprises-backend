import { Controller, Put, Param, Res, HttpStatus, UseGuards, Req, Body } from '@nestjs/common';
import { UpdateUserStatusService } from '../service/updateUserStatusService';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('user/updateUserStatusById/:id')
@UseGuards(AuthGuard)
export class UpdateUserStatusByIdController {
    constructor(private readonly updateUserStatusService: UpdateUserStatusService) { }

    @Put()
    async updateVoucherById(
        @Param('id') id: number,
        @Body() updateUserDTO: UpdateUserDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const { status } = updateUserDTO;
            const voucherResponse = await this.updateUserStatusService.updateUserStatus(id, updateUserDTO, userId);

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

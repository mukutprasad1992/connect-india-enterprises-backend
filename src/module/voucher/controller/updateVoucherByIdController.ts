import { Controller, Put, Param, Res, UseGuards, Req, Body } from '@nestjs/common';
import { UpdateVoucherService } from '../service/updateVoucherByIdService';
import { UpdateVoucherDTO } from '../voucherDTO/updateVoucherDTO';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { errorWhileUpdatingVoucherID, failedToUpdateVoucherID, updatedSuccessfullyByUser, updateVoucherByIdControllerCalledByUserID, voucherID } from '../common/voucherMessage';
@Controller('voucher/updateVoucherById/:id')
@UseGuards(AuthGuard)
export class UpdateVoucherByIdController {
    constructor(
        private readonly updateVoucherService: UpdateVoucherService,
        private readonly logger: AppLogger
    ) { }

    @Put()
    async updateVoucherById(
        @Param('id') id: number,
        @Body() updateVoucherDTO: UpdateVoucherDTO,
        @Res() res,
        @Req() req
    ) {
        const userId = req.user?.id;
        this.logger.doLog(`${updateVoucherByIdControllerCalledByUserID} ${userId} for voucher ID: ${id}`, 'info');

        try {
            const voucherResponse = await this.updateVoucherService.updateVoucher(userId, id, updateVoucherDTO);

            if (voucherResponse.status) {
                this.logger.doLog(`${voucherID} ${id} ${updatedSuccessfullyByUser} ${userId}`, 'success');
                return res.status(200).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToUpdateVoucherID} ${id} by user ${userId}. Reason: ${voucherResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: voucherResponse.message,
                    error: voucherResponse.error,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorWhileUpdatingVoucherID} ${id}: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                error: error.message,
            });
        }
    }
}

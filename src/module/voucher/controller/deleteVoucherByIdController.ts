import { Controller, Delete, Param, Res, UseGuards } from '@nestjs/common';
import { DeleteVoucherByIdService } from '../service/deleteVoucherByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { deleteVoucherByIdControllerInvokedForVoucherID, errorDeletingVoucherID, failedToDeleteVoucherID, voucherDeletedSuccessfullyID } from '../common/voucherMessage';

@Controller('voucher/deleteVoucherById/:id')
@UseGuards(AuthGuard)
export class DeleteVoucherByIdController {
    constructor(
        private readonly deleteVoucherByIdService: DeleteVoucherByIdService,
        private readonly logger: AppLogger
    ) { }

    @Delete()
    async deleteVoucherById(@Param('id') id: number, @Res() res) {
        this.logger.doLog(`${deleteVoucherByIdControllerInvokedForVoucherID} ${id}`, 'info');

        try {
            const deleteResponse = await this.deleteVoucherByIdService.deleteVoucherById(id);

            if (deleteResponse.status === true) {
                this.logger.doLog(`${voucherDeletedSuccessfullyID} ${id}`, 'success');
                return res.status(200).send({
                    status: deleteResponse.status,
                    message: deleteResponse.message,
                    result: deleteResponse.data
                });
            } else {
                this.logger.doLog(
                    `${failedToDeleteVoucherID} ${id}, Reason: ${deleteResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: deleteResponse.status,
                    message: deleteResponse.message,
                    error: deleteResponse.error,
                    result: null
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorDeletingVoucherID} ${id}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                error: error.message,
                data: null
            });
        }
    }
}

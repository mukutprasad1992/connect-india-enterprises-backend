import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { GetVoucherByIdService } from '../service/getVoucherByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { errorFetchingVoucherID, failedToFetchVoucherID, getVoucherByIdControllerCalledFetchingVoucherWithID, voucherFetchedSuccessfullyID } from '../common/voucherMessage';

@Controller('voucher/getVoucherById/:id')
@UseGuards(AuthGuard)
export class GetVoucherByIdController {
    constructor(
        private readonly getVoucherByIdService: GetVoucherByIdService,
        private readonly logger: AppLogger
    ) { }

    @Get()
    async getVocherById(@Param('id') id: number, @Res() res) {
        this.logger.doLog(`${getVoucherByIdControllerCalledFetchingVoucherWithID} ${id}`, 'info');

        try {
            const voucherResponse = await this.getVoucherByIdService.getVoucherById(id);

            if (voucherResponse.status === true) {
                this.logger.doLog(`${voucherFetchedSuccessfullyID} ${id}`, 'success');
                return res.status(200).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data
                });
            } else {
                this.logger.doLog(
                    `${failedToFetchVoucherID} ${id}. Reason: ${voucherResponse.message}`,
                    'warn'
                );
                return res.status(401).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    error: voucherResponse.error,
                    result: null
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorFetchingVoucherID} ${id}: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                error: error.message,
                data: null
            });
        }
    }
}

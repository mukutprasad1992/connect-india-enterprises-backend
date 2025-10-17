import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { CreateVoucherService } from '../service/createVoucherService';
import { CeateVoucherDTO } from '../voucherDTO/createVoucherDTO';
import { JoiValidationVoucher } from '../common/joiValidationVoucher';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    createVoucherControllerCalledByUserId,
    errorWhileCreatingVoucherByUserId,
    voucherCreatedSuccessfullyByUserId,
    voucherCreationFailedByUserId
} from '../common/voucherMessage';
@Controller('voucher/createVoucher')
@UseGuards(AuthGuard)
export class CreateVoucherController {
    constructor(
        private readonly createVoucherService: CreateVoucherService,
        private readonly logger: AppLogger,
    ) { }

    @Post()
    async create(
        @Body(new JoiValidationVoucher()) ceateVoucherDTO: CeateVoucherDTO,
        @Res() res,
        @Req() req
    ) {
        const userId = req.user?.id;
        this.logger.doLog(`${createVoucherControllerCalledByUserId} ${userId}`, 'info');

        try {
            const voucherResponse = await this.createVoucherService.createVoucher(userId, ceateVoucherDTO);

            if (voucherResponse.data && voucherResponse.status === true) {
                this.logger.doLog(`${voucherCreatedSuccessfullyByUserId} ${userId}`, 'success');
                return res.status(201).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: voucherResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${voucherCreationFailedByUserId} ${userId}, reason: ${voucherResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: voucherResponse.status,
                    message: voucherResponse.message,
                    result: null,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorWhileCreatingVoucherByUserId} ${userId}, error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}

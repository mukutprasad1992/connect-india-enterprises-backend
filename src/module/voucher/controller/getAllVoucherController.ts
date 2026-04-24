import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllVoucherService } from '../service/getAllVocherService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  allVouchersRetrievedSuccessfully,
  errorRetrievingVouchers,
  failedToRetrieveVouchersReason,
  getAllVoucherControllerCalledFetchingAllVouchers,
} from '../common/voucherMessage';

@Controller('voucher/getAllVouchers')
@UseGuards(AuthGuard)
export class GetAllVoucherController {
  constructor(
    private readonly getAllVoucherService: GetAllVoucherService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  async getAll(@Res() res, @Req() req) {
    this.logger.doLog(getAllVoucherControllerCalledFetchingAllVouchers, 'info');

    try {
      const vouchersResponse = await this.getAllVoucherService.getAllVouchers();

      if (vouchersResponse.status === true) {
        this.logger.doLog(allVouchersRetrievedSuccessfully, 'success');
        return res.status(200).send({
          status: vouchersResponse.status,
          message: vouchersResponse.message,
          result: vouchersResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToRetrieveVouchersReason} ${vouchersResponse.message}`,
          'warn',
        );
        return res.status(401).send({
          status: vouchersResponse.status,
          message: vouchersResponse.message,
          error: vouchersResponse.error,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(`${errorRetrievingVouchers} ${error.message}`, 'error');
      return res.status(500).send({
        status: false,
        error: error.message,
        data: null,
      });
    }
  }
}

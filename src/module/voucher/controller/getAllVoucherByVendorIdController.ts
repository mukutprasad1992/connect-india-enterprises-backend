import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllVouchersByVendorIdService } from '../service/getAllVoucherByVendorIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  errorRetrievingVouchersForVendorID,
  failedToRetrieveVouchersForVendorID,
  getAllVoucherByVendorIdControllerCalledForVendorID,
  internalServerError,
  vouchersRetrievedSuccessfullyForVendorID,
} from '../common/voucherMessage';

@Controller('voucher/getAllVoucherByVendor')
@UseGuards(AuthGuard)
export class GetAllVoucherByVendorIdController {
  constructor(
    private readonly getAllVouchersByVendorIdService: GetAllVouchersByVendorIdService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  async getAllVouchersByVendor(@Res() res, @Req() req) {
    const vendorId = req.user.id;
    this.logger.doLog(
      `${getAllVoucherByVendorIdControllerCalledForVendorID} ${vendorId}`,
      'info',
    );

    try {
      const voucherResponse =
        await this.getAllVouchersByVendorIdService.getAllVouchersByVendorId(
          vendorId,
        );

      if (voucherResponse.status) {
        this.logger.doLog(
          `${vouchersRetrievedSuccessfullyForVendorID} ${vendorId}`,
          'success',
        );
        return res.status(200).send({
          status: voucherResponse.status,
          message: voucherResponse.message,
          result: voucherResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToRetrieveVouchersForVendorID} ${vendorId}. Reason: ${voucherResponse.message}`,
          'warn',
        );
        return res.status(400).send({
          status: voucherResponse.status,
          message: voucherResponse.message,
          result: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorRetrievingVouchersForVendorID} ${vendorId}. Error: ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: internalServerError,
        error: error.message,
        result: null,
      });
    }
  }
}

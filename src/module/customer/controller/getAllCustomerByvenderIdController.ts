import { Controller, Res, UseGuards, Req, Get, Param } from '@nestjs/common';
import { GetAllCustomersByVenderIdService } from '../service/getAllCustomerByVenderIdService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
  byUserId,
  customerNotFound,
  customersRetrievedSuccessfully,
  getCustomerByVendorIdControllerCustomersForVendor,
  getCustomerByVendorIdControllerFailedToRetrieveCustomersForVendor,
  getCustomerByVendorIdControllerRequestReceivedToFetchCustomersForVendor,
  getCustomerByVendorIdControllerUnexpectedErrorWhileFetchingCustomersForVendor,
  retrievedSuccessfullyByUser,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('customer/getAllCustomerByVendorId/:id')
export class GetCustomerByVendorIdController {
  constructor(
    private readonly getAllCustomersByVenderIdService: GetAllCustomersByVenderIdService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getCustomerByVendorId(@Param('id') id: number, @Res() res, @Req() req) {
    const userId = req.user.id;
    this.logger.doLog(
      `${getCustomerByVendorIdControllerRequestReceivedToFetchCustomersForVendor} (ID: ${id})  ${byUserId} ${userId}`,
      'info',
    );

    try {
      const customersResponse =
        await this.getAllCustomersByVenderIdService.getAllCustomersByVendorId(
          id,
        );

      if (customersResponse.status === true) {
        this.logger.doLog(
          `${getCustomerByVendorIdControllerCustomersForVendor} (ID: ${id}) ${retrievedSuccessfullyByUser} (ID: ${userId})`,
          'success',
        );
        return res.status(200).send({
          status: true,
          message: customersRetrievedSuccessfully,
          data: customersResponse.data,
        });
      } else {
        this.logger.doLog(
          `${getCustomerByVendorIdControllerFailedToRetrieveCustomersForVendor} (ID: ${id}) ${byUserId} ${userId} - ${customersResponse.error || customerNotFound}`,
          'warn',
        );
        return res.status(400).send({
          status: false,
          message: customersResponse.message,
          data: null,
          error: customersResponse.error,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${getCustomerByVendorIdControllerUnexpectedErrorWhileFetchingCustomersForVendor} (ID: ${id}) ${byUserId} ${userId} - ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        error: error.message,
      });
    }
  }
}

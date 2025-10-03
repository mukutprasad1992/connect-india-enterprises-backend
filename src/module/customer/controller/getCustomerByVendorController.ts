import { Controller, Res, UseGuards, Req, Get } from '@nestjs/common';
import { GetAllCustomersByVenderService } from '../service/getCustomerByvedorService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    customerNotFound,
    customersRetrievedSuccessfully,
    getCustomerByVendorControllerCustomersRetrievedSuccessfullyForVendor,
    getCustomerByVendorControllerFailedToRetrieveCustomersForVendor,
    getCustomerByVendorControllerIncomingRequestForVendorCustomers,
    getCustomerByVendorControllerUnexpectedServerErrorWhileFetchingCustomers,
    getCustomerByVendorControllerVendorNotFoundInRequestUserIdMissing,
    vendorNotFound
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('customer/getCustomerByVendor')
export class GetCustomerByVendorController {
    constructor(
        private readonly getAllCustomersByVenderService: GetAllCustomersByVenderService,
        private readonly logger: AppLogger
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getCustomerByVendor(@Res() res, @Req() req) {
        const userId = req.user.id;
        this.logger.doLog(
            `${getCustomerByVendorControllerIncomingRequestForVendorCustomers} (userId: ${userId})`,
            'info'
        );

        try {
            if (!userId) {
                this.logger.doLog(
                    `${getCustomerByVendorControllerVendorNotFoundInRequestUserIdMissing}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: vendorNotFound,
                    data: null,
                });
            }

            const customersResponse = await this.getAllCustomersByVenderService.getAllCustomersByVendor(userId);

            if (customersResponse.status === true) {
                this.logger.doLog(
                    `${getCustomerByVendorControllerCustomersRetrievedSuccessfullyForVendor} (userId: ${userId}).`,
                    'success'
                );
                return res.status(200).send({
                    status: true,
                    message: customersRetrievedSuccessfully,
                    data: customersResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${getCustomerByVendorControllerFailedToRetrieveCustomersForVendor} (userId: ${userId}). Error: ${customersResponse.error || customersResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: customersResponse.message,
                    data: null,
                    error: customersResponse.error,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${getCustomerByVendorControllerUnexpectedServerErrorWhileFetchingCustomers} (userId: ${userId}). Error: ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                error: error.message,
            });
        }
    }
}

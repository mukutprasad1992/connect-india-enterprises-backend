import { Controller, Res, UseGuards, Req, Get } from '@nestjs/common';
import { GetAllCustomerService } from '../service/getAllCustomerService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import {
    customersRetrievedSuccessfully,
    getAllCustomerControllerFailedToRetrieveCustomersForUser,
    getAllCustomerControllerRequestReceivedToFetchALLCustomersByUser,
    getAllCustomerControllerSuccessfullyRetrievedAllCustomersForUser,
    getAllCustomerControllerUnexpectedErrorWhileRetrievingCustomersForUser
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('customer/getAllCustomer')
export class GetAllCustomerController {
    constructor(
        private readonly getAllCustomerService: GetAllCustomerService,
        private readonly logger: AppLogger
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getCustomerByVendor(@Res() res, @Req() req) {
        const userId = req.user.id;
        this.logger.doLog(
            `${getAllCustomerControllerRequestReceivedToFetchALLCustomersByUser} (ID: ${userId})`,
            'info'
        );

        try {
            const customersResponse = await this.getAllCustomerService.getAllCustomer(userId);

            if (customersResponse.status === true) {
                this.logger.doLog(
                    `${getAllCustomerControllerSuccessfullyRetrievedAllCustomersForUser} (ID: ${userId})`,
                    'success'
                );
                return res.status(200).send({
                    status: true,
                    message: customersRetrievedSuccessfully,
                    data: customersResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${getAllCustomerControllerFailedToRetrieveCustomersForUser} (ID: ${userId}) - ${customersResponse.error || customersResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: customersResponse.message,
                    data: null,
                    error: customersResponse.error
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${getAllCustomerControllerUnexpectedErrorWhileRetrievingCustomersForUser} (ID: ${userId}) - ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                error: error.message,
            });
        }
    }
}

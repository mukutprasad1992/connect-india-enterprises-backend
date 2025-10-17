import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GetAllVendorService } from '../service/getAllvendorService';
import {
    errorOccurredWhileFetchingVendors,
    failedToFetchVendorsMessage,
    fetchingAllVendorsRequestReceived,
    vendorsSuccessfully
} from '../common/userMessage';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('user/getAllVendor')
@UseGuards(AuthGuard)
export class GetAllVendorController {
    constructor(
        private readonly getAllVendorService: GetAllVendorService,
        private readonly logger: AppLogger
    ) { }

    @Get()
    async getAllVedor(@Res() res) {
        this.logger.doLog(fetchingAllVendorsRequestReceived, 'info');

        try {
            const vendorsResponse = await this.getAllVendorService.getAllVendor();

            if (vendorsResponse.status === true) {
                this.logger.doLog(
                    `Fetched ${vendorsResponse.data?.length || 0} ${vendorsSuccessfully}`,
                    'success'
                );
                return res.status(200).send({
                    status: vendorsResponse.status,
                    message: vendorsResponse.message,
                    data: vendorsResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToFetchVendorsMessage} ${vendorsResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: vendorsResponse.status,
                    message: vendorsResponse.message,
                    data: vendorsResponse.data,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorOccurredWhileFetchingVendors} ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                message: errorOccurredWhileFetchingVendors,
                error: error.message || error,
            });
        }
    }
}

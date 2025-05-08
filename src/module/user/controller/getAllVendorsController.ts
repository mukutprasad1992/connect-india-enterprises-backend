import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GetAllVendorService } from '../service/getAllvendorService';
import {
    errorOccurredWhileFetchingVendors
} from '../common/userMessage'
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
@Controller('user/getAllVendor')
@UseGuards(AuthGuard)
export class GetAllVendorController {
    constructor(private readonly getAllVendorService: GetAllVendorService) { }

    @Get()
    async getAllVedor(@Res() res) {
        try {
            const vendorsResponse = await this.getAllVendorService.getAllVendor();
            if (vendorsResponse.status === true) {
                return res.status(200).send({
                    status: vendorsResponse.status,
                    message: vendorsResponse.message,
                    data: vendorsResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: vendorsResponse.status,
                    message: vendorsResponse.message,
                    data: vendorsResponse.data
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: errorOccurredWhileFetchingVendors,
                error: error.message || error,
            });
        }
    }
}

import { Controller, Res, UseGuards, Req, Param, Delete } from '@nestjs/common';
import { DeleteCustomerByIdService } from '../service/deleteCustomerService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { byUserId, deleteCustomerByIdControllerCustomer, deleteCustomerByIdControllerFailedToDeleteCustomer, deleteCustomerByIdControllerRequestReceivedToDeleteCustomer, deleteCustomerByIdControllerUnexpectedErrorWhileDeletingCustomer, deletedSuccessfullyByUser } from '../common/customerMessage';

@Controller('customer/deleteCustomerById/:id')
export class DeleteCustomerByIdController {
    constructor(
        private readonly deleteCustomerByIdService: DeleteCustomerByIdService,
        private readonly logger: AppLogger
    ) { }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteCustomerByVendorId(@Param('id') id: number, @Res() res, @Req() req) {
        const userId = req.user.id;
        this.logger.doLog(
            `${deleteCustomerByIdControllerRequestReceivedToDeleteCustomer} (ID: ${id}) ${byUserId} ${userId}`,
            'info'
        );

        try {
            const customersResponse = await this.deleteCustomerByIdService.deleteCustomerById(id);

            if (customersResponse.status === true) {
                this.logger.doLog(
                    `${deleteCustomerByIdControllerCustomer} (ID: ${id}) ${deletedSuccessfullyByUser} (ID: ${userId})`,
                    'success'
                );
                return res.status(200).send({
                    status: true,
                    message: customersResponse.message,
                    data: customersResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${deleteCustomerByIdControllerFailedToDeleteCustomer} (ID: ${id}) ${byUserId} ${userId} - ${customersResponse.error || 'Customer not found'}`,
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
                `${deleteCustomerByIdControllerUnexpectedErrorWhileDeletingCustomer} (ID: ${id}) ${byUserId} ${userId} - ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                error: error.message,
            });
        }
    }
}

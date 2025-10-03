import { Controller, Post, Body, Res, UseGuards, Req, Put, Param } from '@nestjs/common';
import { UpdateCustomerService } from '../service/updateCustomerService';
import { UpdateCustomerDTO } from '../customerDTO/updateCustomerDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { JoiValidationCustomer } from '../common/joiValidationCustomer';
import {
    customerUpdationError,
    updateCustomerControllerCustomerUpdatedSuccessfully,
    updateCustomerControllerFailedToUpdateCustomer,
    updateCustomerControllerIncomingRequestToUpdateCustomer,
    updateCustomerControllerUnexpectedServerErrorWhileUpdatingCustomer,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('customers/updateCustomer/:id')
export class UpdateCustomerController {
    constructor(
        private readonly updateCustomerService: UpdateCustomerService,
        private readonly logger: AppLogger
    ) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateCustomer(
        @Param('id') id: number,
        @Body(new JoiValidationCustomer()) updateCustomerDTO: UpdateCustomerDTO,
        @Res() res,
        @Req() req
    ) {
        const userId = req.user.id;
        this.logger.doLog(
            `${updateCustomerControllerIncomingRequestToUpdateCustomer} (customerId: ${id}, userId: ${userId})`,
            'info'
        );

        try {
            const customerResponse = await this.updateCustomerService.updateCustomer(userId, id, updateCustomerDTO);

            if (customerResponse.status === true) {
                this.logger.doLog(
                    `${updateCustomerControllerCustomerUpdatedSuccessfully} (customerId: ${id}, userId: ${userId})`,
                    'success'
                );
                return res.status(201).send({
                    status: true,
                    message: customerResponse.message,
                    data: customerResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${updateCustomerControllerFailedToUpdateCustomer} (customerId: ${id}, userId: ${userId}). Error: ${customerResponse.error || customerResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: false,
                    message: customerResponse.message,
                    error: customerResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${updateCustomerControllerUnexpectedServerErrorWhileUpdatingCustomer} (customerId: ${id}, userId: ${userId}). Error: ${error.message}`,
                'error'
            );
            return res.status(500).send({
                status: false,
                message: customerUpdationError,
                error: error.message,
            });
        }
    }
}

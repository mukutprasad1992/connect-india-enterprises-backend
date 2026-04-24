import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { CreateCustomerService } from '../service/createCustomerService';
import { CreateCustomerDTO } from '../customerDTO/createCustomerDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { JoiValidationCustomer } from '../common/joiValidationCustomer';
import {
  createCustomerControllerCustomerCreatedSuccessfullyByUse,
  createCustomerControllerFailedToCreateCustomerByUser,
  createCustomerControllerRequestReceivedToCreateCustomerByUser,
  createCustomerControllerUnexpectedErrorWhileCreatingCustomerByUser,
  customerCreatedSuccessfully,
  customerCreationError,
} from '../common/customerMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('customers/createCustomer')
export class CreateCustomerController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createCustomer(
    @Body(new JoiValidationCustomer()) createCustomerDto: CreateCustomerDTO,
    @Res() res,
    @Req() req,
  ) {
    const userId = req.user.id;
    this.logger.doLog(
      `${createCustomerControllerRequestReceivedToCreateCustomerByUser} (ID: ${userId})`,
      'info',
    );

    try {
      const customerResponse = await this.createCustomerService.createCustomer(
        userId,
        createCustomerDto,
      );

      if (customerResponse.status === true) {
        this.logger.doLog(
          `${createCustomerControllerCustomerCreatedSuccessfullyByUse} (ID: ${userId})`,
          'success',
        );
        return res.status(201).send({
          status: true,
          message: customerResponse.message || customerCreatedSuccessfully,
          data: customerResponse.data,
        });
      } else {
        this.logger.doLog(
          `${createCustomerControllerFailedToCreateCustomerByUser} (ID: ${userId}) - ${customerResponse.error || 'Validation/DB error'}`,
          'warn',
        );
        return res.status(400).send({
          status: false,
          message: customerResponse.message,
          error: customerResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${createCustomerControllerUnexpectedErrorWhileCreatingCustomerByUser} (ID: ${userId}) - ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: customerCreationError,
        error: error.message,
      });
    }
  }
}

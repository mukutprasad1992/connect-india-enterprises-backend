import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateInsuranceDTO } from '../insuranceDTO/createInsuranceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationInsurance } from '../common/joiValidationInsurance';
import { CreateInsuranceService } from '../service/createInsuranceService';
import {
  insuranceCreationError,
  insuranceCreatedSuccessfully,
  insuranceCreationStarted,
  insuranceCreationFailed,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('insurance/createInsurance')
export class CreateInsuranceController {
  constructor(
    private readonly createInsuranceService: CreateInsuranceService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * @route   POST /insurance/createInsurance
   * @desc    Creates a new insurance entry for the authenticated user
   * @access  Protected (AuthGuard)
   */
  @UseGuards(AuthGuard)
  @Post()
  async createInsurance(
    @Body(new ValidationInsurance(CreateInsuranceDTO.getValidationSchema()))
    createInsuranceDTO: CreateInsuranceDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).user.id;

    this.logger.doLog(
      `${insuranceCreationStarted} (User ID: ${userId})`,
      'info',
    );

    try {
      const insuranceResponse =
        await this.createInsuranceService.createInsurance(
          userId,
          createInsuranceDTO,
        );

      // ✅ Success response
      if (insuranceResponse.status === true) {
        this.logger.doLog(
          `${insuranceCreatedSuccessfully} (User ID: ${userId}, ServiceRequestId: ${insuranceResponse?.data?.serviceRequestId || 'N/A'})`,
          'success',
        );

        return res.status(201).send({
          status: true,
          message: insuranceResponse.message,
          data: insuranceResponse.data,
          notification: insuranceResponse.notification || null,
        });
      }

      // ❌ Failure response (handled but not exception)
      this.logger.doLog(
        `${insuranceCreationFailed} (User ID: ${userId}) - ${insuranceResponse.message}`,
        'warn',
      );

      return res.status(400).send({
        status: false,
        message: insuranceResponse.message,
        error: insuranceResponse.error || null,
        data: null,
      });
    } catch (error: any) {
      // 🚨 Unexpected server error
      this.logger.doLog(
        `${insuranceCreationError} (User ID: ${userId}): ${error.message}`,
        'error',
      );

      return res.status(500).send({
        status: false,
        message: insuranceCreationError,
        error: error.message,
      });
    }
  }
}

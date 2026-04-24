import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateLoanDTO } from '../loanDTO/createLoanDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationLoan } from '../common/joiValidationLoan';
import { CreateLoanService } from '../services/createLoanService';
import {
  loanCreatedSuccessfully,
  loanCreationError,
  loanAlreadyExistsOrValidationFailed,
  creatingLoanRequestForUserId,
} from '../common/loanMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('loan/createLoan')
export class CreateLoanController {
  constructor(
    private readonly createLoanService: CreateLoanService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * @route   POST /loan/createLoan
   * @desc    Create a new loan entry
   * @access  Protected (AuthGuard)
   */
  @UseGuards(AuthGuard)
  @Post()
  async createLoan(
    @Body(new ValidationLoan(CreateLoanDTO.getValidationSchema()))
    createLoanDTO: CreateLoanDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).user.id;

    this.logger.doLog(`${creatingLoanRequestForUserId} ${userId}`, 'info');

    try {
      const loanResponse = await this.createLoanService.createLoan(
        userId,
        createLoanDTO,
      );

      // ✅ Loan created successfully
      if (loanResponse.status === true) {
        this.logger.doLog(
          `${loanCreatedSuccessfully} (userId: ${userId})`,
          'success',
        );

        return res.status(201).send({
          status: true,
          message: loanResponse.message,
          data: loanResponse.data,
          notification: loanResponse.notification || null,
        });
      }

      // ❌ Loan already exists or validation failed
      this.logger.doLog(
        `${loanAlreadyExistsOrValidationFailed} (userId: ${userId})`,
        'warn',
      );

      return res.status(400).send({
        status: false,
        message: loanResponse.message,
        error: loanResponse.error || null,
        data: null,
      });
    } catch (error: any) {
      // 🚨 Unexpected Server Error
      this.logger.doLog(
        `${loanCreationError} (userId: ${userId}): ${error.message}`,
        'error',
      );

      return res.status(500).send({
        status: false,
        message: loanCreationError,
        error: error.message,
      });
    }
  }
}

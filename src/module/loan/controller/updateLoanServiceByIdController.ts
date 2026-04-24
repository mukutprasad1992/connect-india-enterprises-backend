import {
  Controller,
  Put,
  Param,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UpdateLoanByIdService } from '../services/updateLoanByIdService';
import { UpdateLoanDTO } from '../loanDTO/updateLoanDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationLoan } from '../common/joiValidationLoan';
import {
  errorUpdatingLoan,
  failedToUpdateLoan,
  forUser,
  loanUpdatedSuccessfully,
  loanUpdateError,
  updatingLoanWithID,
} from '../common/loanMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('loan/updateLoanById')
export class UpdateLoanByIdController {
  constructor(
    private readonly updateLoanByIdService: UpdateLoanByIdService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * @route   PUT /loan/updateLoanById/:id
   * @desc    Update a loan by ID
   * @access  Protected (AuthGuard)
   */
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateLoanById(
    @Param('id') id: number,
    @Body(new ValidationLoan(UpdateLoanDTO.getValidationSchema()))
    updateLoanDTO: UpdateLoanDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    this.logger.doLog(
      `${updatingLoanWithID} ${id} ${forUser} ${userId}`,
      'info',
    );

    try {
      const updateResponse = await this.updateLoanByIdService.updateLoanById(
        id,
        userId,
        updateLoanDTO,
      );

      if (updateResponse.status === true) {
        this.logger.doLog(
          `${loanUpdatedSuccessfully} (loanId: ${id}, userId: ${userId})`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: updateResponse.message,
          data: updateResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToUpdateLoan} (loanId: ${id}, userId: ${userId}): ${updateResponse.message}`,
          'warn',
        );

        return res.status(400).send({
          status: false,
          message: updateResponse.message,
          error: updateResponse.error || null,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorUpdatingLoan} (loanId: ${id}, userId: ${userId}): ${error.message}`,
        'error',
      );

      return res.status(500).send({
        status: false,
        message: loanUpdateError,
        error: error.message,
      });
    }
  }
}

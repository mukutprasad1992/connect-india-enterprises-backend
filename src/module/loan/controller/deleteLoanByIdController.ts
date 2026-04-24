import {
  Controller,
  Delete,
  Param,
  Res,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { DeleteLoanByIdService } from '../services/deleteLoanByIdService';
import {
  loanDeletedSuccessfully,
  loanNotFoundOrAlreadyDeleted,
  loanDeletionError,
  deletingLoanWithID,
} from '../common/loanMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('loan/deleteLoanById')
export class DeleteLoanByIdController {
  constructor(
    private readonly deleteLoanByIdService: DeleteLoanByIdService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * @route   DELETE /loan/deleteLoanById/:id
   * @desc    Delete a loan by ID
   * @access  Protected (AuthGuard)
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteLoanById(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;

    this.logger.doLog(
      `${deletingLoanWithID} ${id} for user: ${userId}`,
      'info',
    );

    try {
      const deleteResponse = await this.deleteLoanByIdService.deleteLoanById(
        id,
        userId,
      );

      if (deleteResponse.status === true) {
        this.logger.doLog(
          `${loanDeletedSuccessfully} (loanId: ${id}, userId: ${userId})`,
          'success',
        );

        return res.status(200).send({
          status: true,
          message: deleteResponse.message,
          data: null,
        });
      } else {
        this.logger.doLog(
          `${loanNotFoundOrAlreadyDeleted} (loanId: ${id}, userId: ${userId})`,
          'warn',
        );

        return res.status(400).send({
          status: false,
          message: deleteResponse.message,
          data: null,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${loanDeletionError} (loanId: ${id}, userId: ${userId}): ${error.message}`,
        'error',
      );

      return res.status(500).send({
        status: false,
        message: loanDeletionError,
        error: error.message,
      });
    }
  }
}

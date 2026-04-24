import { Controller, Post, Body, Res } from '@nestjs/common';
import { ResetPasswordService } from '../service/authResetPasswordService';
import { ResetPasswordDTO } from '../authDTO/resetPasswordDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  errorDuringPasswordResetToken,
  passwordResetAttemptToken,
  passwordResetFailedToken,
  passwordResetSuccessfulToken,
} from '../common/authMessage';

@Controller('auth/resetPassword')
export class ResetPasswordController {
  constructor(
    private readonly ResetPasswordService: ResetPasswordService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  async resetPassword(
    @Body(new JoiValidationAuth(ResetPasswordDTO.resetPasswordSchema))
    resetPasswordDTO: ResetPasswordDTO,
    @Res() res,
  ) {
    const { token } = resetPasswordDTO;
    this.logger.doLog(`${passwordResetAttemptToken} ${token}`, 'success');

    try {
      const result = await this.ResetPasswordService.resetPassword(
        token,
        resetPasswordDTO.newPassword,
      );

      if (result.status === true) {
        this.logger.doLog(
          `${passwordResetSuccessfulToken} ${token}`,
          'success',
        );
        return res.status(200).send({
          status: result.status,
          message: result.message,
        });
      } else {
        this.logger.doLog(
          `${passwordResetFailedToken} ${token}, Reason: ${result.message}`,
          'fail',
        );
        return res.status(400).send({
          status: result.status,
          message: result.message,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorDuringPasswordResetToken} ${token}, Error: ${error.message}`,
        'fail',
      );
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
}

import { Controller, Post, Body, Res } from '@nestjs/common';
import { ResetPasswordService } from '../service/authResetPasswordService';
import { ResetPasswordDTO } from '../authDTO/resetPasswordDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth';

@Controller('auth/resetPassword')
export class ResetPasswordController {
    constructor(private readonly ResetPasswordService: ResetPasswordService) { }

    @Post()
    async resetPassword(
        @Body(new JoiValidationAuth(ResetPasswordDTO.resetPasswordSchema)) resetPasswordDTO: ResetPasswordDTO,
        @Res() res,
    ) {
        try {
            const { token, newPassword } = resetPasswordDTO;
            const result = await this.ResetPasswordService.resetPassword(token, newPassword);

            if (result.status === true) {
                return res.status(200).send({
                    status: result.status,
                    message: result.message,
                });
            } else {
                return res.status(400).send({
                    status: result.status,
                    message: result.message,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }
}

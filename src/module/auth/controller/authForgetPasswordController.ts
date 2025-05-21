import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ForgetPasswordService } from '../service/authForgetPasswordService';
import { anErrorOccurredWhileSendingResetEmail } from '../common/authMessage';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import { ForgetPasswordDTO } from '../authDTO/forgetPasswordDTO';

@Controller('auth/forgotPassword')
export class ForgetPasswordController {
    constructor(private readonly ForgetPasswordService: ForgetPasswordService) { }
    @Post()
    async forgotPassword(@Body(new JoiValidationAuth(ForgetPasswordDTO.forgetPasswordSchema))
    forgetPasswordDTO: ForgetPasswordDTO, email: string, @Res() res) {
        try {
            const response = await this.ForgetPasswordService.handleForgotPassword(forgetPasswordDTO.email);
            if (response.status === true) {
                return res.status(200).send({
                    status: response.status,
                    message: response.message,
                });
            }
            else {
                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileSendingResetEmail,
                error: error.message,
            });
        }
    }
}

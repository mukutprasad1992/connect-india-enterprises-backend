import { Controller, Put, Body, Param, Res, UseGuards, Request, Post } from '@nestjs/common';
import { ChangePasswordService } from '../service/authChangePasswordService';
import { ChangePasswordDTO } from '../authDTO/changePasswordDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth'
import { anErrorOccurredWhileLoggingInTheUser } from '../common/authMessage';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('auth/changePassword')
export class ChangePasswordController {
    constructor(
        private readonly ChangePasswordService: ChangePasswordService,
    ) { }
    @Post()
    @UseGuards(AuthGuard)
    async changePassword(
        @Body(new JoiValidationAuth(ChangePasswordDTO.changePasswordSchema)) changePasswordDTO: ChangePasswordDTO, @Request() req,
        @Res() res
    ): Promise<any> {
        try {
            const id = req.user.id;
            const response = await this.ChangePasswordService.changePassword(id, changePasswordDTO);
            if (response.status === false) {
                return res.status(400).send({
                    status: response.status,
                    message: response.message,
                    data: response.data
                });
            }
            else {
                return res.status(200).send({
                    status: response.status,
                    message: response.message,
                    data: response.data,
                });
            }

        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileLoggingInTheUser,
                error: error.message,
            });
        }
    }
}

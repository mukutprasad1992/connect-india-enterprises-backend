import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { LoginService } from '../service/authLoginService';
import { LoginDTO } from '../authDTO/loginAuthDTO';
import { anErrorOccurredWhileLoggingInTheUser } from '../common/authMessage';
import { JoiValidationAuth } from '../common/joiValidationAuth';

@Controller('auth/login')
export class LoginController {
    constructor(private readonly LoginService: LoginService) { }
    @Post()
    async login(@Body(new JoiValidationAuth(LoginDTO.loginSchema)) loginDto: LoginDTO, @Res() res) {
        try {
            const result = await this.LoginService.login(loginDto);
            if (result.status === false) {
                return res.status(401).send({
                    status: false,
                    message: result.message,
                    error: result.error,
                    data: result.data
                });
            }
            return res.status(201).send({
                status: result.status,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileLoggingInTheUser,
                error: error.message
            });
        }
    }
}

import {
    Controller,
    Post,
    Body,
    Res,
    HttpStatus,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';
import { LoginService } from '../service/authLoginService';
import { LoginDTO } from '../authDTO/loginAuthDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import { JwtAuthGuard } from 'src/midlewares/JwtAuthGuard';
import { anErrorOccurredWhileLoggingInTheUser } from '../common/authMessage';

@Controller('auth')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Post('login')
    async login(@Body(new JoiValidationAuth(LoginDTO.loginSchema)) loginDto: LoginDTO, @Res() res) {
        try {
            const result = await this.loginService.login(loginDto);
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
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req, @Res() res) {
        try {
            const user = await this.loginService.getUserById(req.user.id);
            if (!user) {
                return res
                    .status(400)
                    .json({ status: false, message: 'User not found' });
            }
            return res.status(200).json({ status: true, data: user });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Error fetching user data',
                error: error.message,
            });
        }
    }
}

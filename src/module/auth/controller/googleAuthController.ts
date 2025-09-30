import {
    Controller,
    Get,
    Req,
    Res,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { GoogleAuthService } from '../service/googleAuthService';
import { AuthGuard } from '@nestjs/passport';
import { googleCallbackError, googleLoginFailedNoUserReturned, googleLoginFailedTryAgain } from '../common/authMessage';

@Controller('auth/google')
export class GoogleAuthController {
    constructor(private readonly googleAuthService: GoogleAuthService) { }

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleLogin() {
    }

    @Get('callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req, @Res() res) {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .send({
                        status: false,
                        message: googleLoginFailedNoUserReturned
                    });
            }

            const result = await this.googleAuthService.login(req.user);

            if (!result || !result.data || !result.data.accessToken) {
                return res
                    .status(500)
                    .send({
                        status: false,
                        message: googleLoginFailedTryAgain
                    });
            }

            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(
                `${frontendURL}/authentication/login?token=${result.data.accessToken}`
            );
        } catch (error) {
            console.error(googleCallbackError, error);
            return res
                .status(500)
                .send({
                    status: false,
                    message: googleLoginFailedTryAgain
                });
        }
    }
}

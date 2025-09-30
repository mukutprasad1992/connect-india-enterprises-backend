import {
    Controller,
    Get,
    Req,
    Res,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { FacebookAuthService } from '../service/facebookAuthService';
import { AuthGuard } from '@nestjs/passport';
import { facebookLoginFailed } from '../common/authMessage';

@Controller('auth/facebook')
export class FacebookAuthController {
    constructor(private readonly facebookAuthService: FacebookAuthService) { }

    @Get()
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin() {
    }

    @Get('callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req, @Res() res) {
        try {
            const result = await this.facebookAuthService.login(req.user);
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

            return res.redirect(
                `${frontendURL}/authentication/login?token=${result.data.accessToken}`,
            );
        } catch (error) {
            return res
                .status(500)
                .send({
                    status: false,
                    message: facebookLoginFailed
                });
        }
    }
}

import {
    Controller,
    Get,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { FacebookAuthService } from '../service/facebookAuthService';
import { AuthGuard } from '@nestjs/passport';
import {
    facebookLoginCallbackReceivedUser,
    facebookLoginFailed,
    facebookLoginFailedUser,
    facebookLoginInitiated,
    facebookLoginSuccessfulUser
} from '../common/authMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('auth/facebook')
export class FacebookAuthController {
    constructor(
        private readonly facebookAuthService: FacebookAuthService,
        private readonly logger: AppLogger,
    ) { }

    @Get()
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin() {
        this.logger.doLog(`${facebookLoginInitiated}`, 'success');
    }

    @Get('callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req, @Res() res) {
        const user = req.user;
        this.logger.doLog(`${facebookLoginCallbackReceivedUser} ${user?.email || 'Unknown'}`, 'success');

        try {
            const result = await this.facebookAuthService.login(user);
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

            this.logger.doLog(`${facebookLoginSuccessfulUser} ${user?.email || 'Unknown'}`, 'success');

            return res.redirect(
                `${frontendURL}/authentication/login?token=${result.data.accessToken}`,
            );
        } catch (error) {
            this.logger.doLog(
                `${facebookLoginFailedUser} ${user?.email || 'Unknown'}, Error: ${error.message}`,
                'fail',
            );

            return res.status(500).send({
                status: false,
                message: facebookLoginFailed,
            });
        }
    }
}

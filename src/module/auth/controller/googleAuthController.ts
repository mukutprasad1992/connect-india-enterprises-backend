import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthService } from '../service/googleAuthService';
import { AuthGuard } from '@nestjs/passport';
import {
  googleCallbackError,
  googleLoginCallbackReceivedUser,
  googleLoginErrorUser,
  googleLoginFailedInvalidLoginResultForUser,
  googleLoginFailedNoUserReturned,
  googleLoginFailedNoUserReturnedFromGoogle,
  googleLoginFailedTryAgain,
  googleLoginInitiated,
  googleLoginSuccessfulUser,
} from '../common/authMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    this.logger.doLog(googleLoginInitiated, 'success');
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
    this.logger.doLog(
      `${googleLoginCallbackReceivedUser} ${user?.email || 'Unknown'}`,
      'success',
    );

    try {
      if (!user) {
        this.logger.doLog(googleLoginFailedNoUserReturnedFromGoogle, 'fail');
        return res.status(401).send({
          status: false,
          message: googleLoginFailedNoUserReturned,
        });
      }

      const result = await this.googleAuthService.login(user);

      if (!result || !result.data || !result.data.accessToken) {
        this.logger.doLog(
          `${googleLoginFailedInvalidLoginResultForUser} ${user.email}`,
          'fail',
        );
        return res.status(500).send({
          status: false,
          message: googleLoginFailedTryAgain,
        });
      }

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      this.logger.doLog(
        `${googleLoginSuccessfulUser} ${user.email}`,
        'success',
      );

      return res.redirect(
        `${frontendURL}/authentication/login?token=${result.data.accessToken}`,
      );
    } catch (error: any) {
      this.logger.doLog(
        `${googleLoginErrorUser} ${user?.email || 'Unknown'}, Error: ${error.message}`,
        'fail',
      );
      return res.status(500).send({
        status: false,
        message: googleLoginFailedTryAgain,
      });
    }
  }
}

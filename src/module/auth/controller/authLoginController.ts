import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginService } from '../service/authLoginService';
import { LoginDTO } from '../authDTO/loginAuthDTO';
import { JoiValidationAuth } from '../common/joiValidationAuth';
import { JwtAuthGuard } from 'src/midlewares/JwtAuthGuard';
import {
  anErrorOccurredWhileLoggingInTheUser,
  errorDuringLoginEmail,
  errorFetchingUserData,
  errorFetchingUserDataUserId,
  fetchLoggedInUserDataUserId,
  loginAttemptEmail,
  loginFailedEmail,
  loginSuccessfulEmail,
  userDataFetchedSuccessfullyUserId,
  userNotFound,
  userNotFoundUserId,
} from '../common/authMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: AppLogger,
  ) {}

  @Post('login')
  async login(
    @Body(new JoiValidationAuth(LoginDTO.loginSchema)) loginDto: LoginDTO,
    @Res() res,
  ) {
    this.logger.doLog(`${loginAttemptEmail} ${loginDto.email}`, 'success');

    try {
      const result = await this.loginService.login(loginDto);

      if (result.status === false) {
        this.logger.doLog(
          `${loginFailedEmail} ${loginDto.email}, Reason: ${result.message}`,
          'fail',
        );
        return res.status(401).send({
          status: false,
          message: result.message,
          error: result.error,
          data: result.data,
        });
      }

      this.logger.doLog(`${loginSuccessfulEmail} ${loginDto.email}`, 'success');
      return res.status(201).send({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      this.logger.doLog(
        `${errorDuringLoginEmail} ${loginDto.email}, Error: ${error.message}`,
        'fail',
      );
      return res.status(500).send({
        status: false,
        message: anErrorOccurredWhileLoggingInTheUser,
        error: error.message,
      });
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req, @Res() res) {
    this.logger.doLog(
      `${fetchLoggedInUserDataUserId} ${req.user.id}`,
      'success',
    );

    try {
      const user = await this.loginService.getUserById(req.user.id);

      if (!user) {
        this.logger.doLog(`${userNotFoundUserId} ${req.user.id} `, 'fail');
        return res.status(400).json({
          status: false,
          message: userNotFound,
        });
      }

      this.logger.doLog(
        `${userDataFetchedSuccessfullyUserId} ${req.user.id} `,
        'success',
      );
      return res.status(200).json({ status: true, data: user });
    } catch (error: any) {
      this.logger.doLog(
        `${errorFetchingUserDataUserId} ${req.user.id}, Error: ${error.message} `,
        'fail',
      );
      return res.status(500).json({
        status: false,
        message: errorFetchingUserData,
        error: error.message,
      });
    }
  }
}

import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GetAllUserService } from '../service/getAllUserService';
import { UserSchema } from '../userEntity/userSchema';
import {
  errorOccurredWhileFetchingUsers,
  failedToFetchUsersMessage,
  fetchingAllUsersRequestReceived,
  usersSuccessfully,
} from '../common/userMessage';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('user/getAllUser')
@UseGuards(AuthGuard)
export class GetAllUserController {
  constructor(
    private readonly GetAllUserService: GetAllUserService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  async getAllUser(@Res() res) {
    this.logger.doLog(fetchingAllUsersRequestReceived, 'info');

    try {
      const usersResponse = await this.GetAllUserService.getAllUser();

      if (usersResponse.status === true) {
        this.logger.doLog(
          `Fetched ${usersResponse.data?.length || 0} ${usersSuccessfully}`,
          'success',
        );
        return res.status(200).send({
          status: usersResponse.status,
          message: usersResponse.message,
          data: usersResponse.data,
        });
      } else {
        this.logger.doLog(
          `${failedToFetchUsersMessage} ${usersResponse.message}`,
          'warn',
        );
        return res.status(400).send({
          status: usersResponse.status,
          message: usersResponse.message,
          data: usersResponse.data,
        });
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileFetchingUsers} ${error.message}`,
        'error',
      );
      return res.status(500).send({
        status: false,
        message: errorOccurredWhileFetchingUsers,
        error: error.message || error,
      });
    }
  }
}

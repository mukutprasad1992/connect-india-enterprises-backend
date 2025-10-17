import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { GetUserByIdService } from '../service/getUserByIdService';
import { ValidateUserId } from '../common/commonValidation';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { AppLogger } from 'src/utils/common/loggerService';
import { errorOccurredWhileRetrievingUserID, failedToRetrieveUserForID, getUserByIDRequestReceivedForID, invalidUserIDProvided, userRetrievedSuccessfullyForID } from '../common/userMessage';

@Controller('user/getUserById/:id')
@UseGuards(AuthGuard)
export class GetUserByIdController {
    constructor(
        private readonly GetUserByIdService: GetUserByIdService,
        private readonly logger: AppLogger
    ) { }

    @Get()
    async getUserById(@Param('id') id: number, @Res() res) {
        this.logger.doLog(`${getUserByIDRequestReceivedForID} ${id}`, 'info');

        try {
            const validationResponse = await ValidateUserId.isUserId(id);
            if (validationResponse && validationResponse.statusCode) {
                this.logger.doLog(`${invalidUserIDProvided} ${id}`, 'warn');
                return res.status(400).send({
                    status: validationResponse.status,
                    message: validationResponse.message,
                });
            }

            const userResponse = await this.GetUserByIdService.getUserById(id);

            if (userResponse.status === true) {
                this.logger.doLog(`${userRetrievedSuccessfullyForID} ${id}`, 'success');
                return res.status(200).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    data: userResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToRetrieveUserForID} ${id}, Message: ${userResponse.message}`,
                    'warn'
                );
                return res.status(400).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    data: userResponse.data,
                    error: userResponse.error,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorOccurredWhileRetrievingUserID} ${id}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }
}

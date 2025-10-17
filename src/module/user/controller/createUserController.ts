import { Controller, Post, Body, Res } from '@nestjs/common';
import { UserCreateService } from '../service/createUserService';
import { CreateUserDTO } from '../userDTO/createUserDTO';
import { emailIsAlreadyExist, errorOccurredDuringUserRegistrationEmail, registrationFailedEmailAlreadyExists, userCreatedSuccessfullyID, userCreationFailedEmail, userRegistrationAttemptStartedForEmail } from '../common/userMessage';
import { ValidationUser } from '../common/joiValidationUser';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('user/register')
export class CreateUserController {
    constructor(
        private readonly UserCreateService: UserCreateService,
        private readonly logger: AppLogger
    ) { }

    @Post()
    async create(
        @Body(new ValidationUser(CreateUserDTO.userSchema)) createUserDTO: CreateUserDTO,
        @Res() res
    ) {
        this.logger.doLog(`${userRegistrationAttemptStartedForEmail} ${createUserDTO.email}`, 'info');

        try {
            const isEmailTaken = await this.UserCreateService.isEmailExist(createUserDTO.email);
            if (isEmailTaken) {
                this.logger.doLog(`${registrationFailedEmailAlreadyExists} ${createUserDTO.email}`, 'warn');
                return res.status(400).send({
                    status: false,
                    message: emailIsAlreadyExist,
                    result: null,
                });
            }

            const userResponse = await this.UserCreateService.createUser(createUserDTO);

            if (userResponse.data && userResponse.status === true) {
                this.logger.doLog(`${userCreatedSuccessfullyID} ${userResponse.data.id}, Email: ${createUserDTO.email}`, 'success');
                return res.status(201).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    result: userResponse.data,
                });
            } else {
                this.logger.doLog(`${userCreationFailedEmail} ${createUserDTO.email}, Message: ${userResponse.message}`, 'warn');
                return res.status(400).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    result: null,
                });
            }
        } catch (error) {
            this.logger.doLog(`${errorOccurredDuringUserRegistrationEmail} ${createUserDTO.email}, Error: ${error.message}`, 'error');
            return res.status(500).send({
                status: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}

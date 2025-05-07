import { Controller, Post, Body, Res, HttpStatus, ValidationPipe } from '@nestjs/common';
import { UserCreateService } from '../service/createUserService';
import { CreateUserDTO } from '../userDTO/createUserDTO';
import { emailIsAlreadyExist, anErrorOccurredWhileCreatingTheUser } from '../common/userMessage';
import { ValidationUser } from '../common/joiValidationUser';

@Controller('user/register')
export class CreateUserController {
    constructor(private readonly UserCreateService: UserCreateService) { }
    @Post()
    async create(@Body(new ValidationUser(CreateUserDTO.userSchema)) createUserDTO: CreateUserDTO, @Res() res) {
        try {
            const isEmailTaken = await this.UserCreateService.isEmailExist(createUserDTO.email);
            if (isEmailTaken) {
                return res.status(400).send({
                    status: false,
                    message: emailIsAlreadyExist,
                    result: null,
                });
            }
            const userResponse = await this.UserCreateService.createUser(createUserDTO);
            if (userResponse.data && userResponse.status === true) {
                return res.status(201).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    result: userResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}

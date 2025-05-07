import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GetAllUserService } from '../service/getAllUserService';
import { UserSchema } from '../userEntity/userSchema';
import {
    errorOccurredWhileFetchingUsers
} from '../common/userMessage'
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
@Controller('user/getAllUser')
@UseGuards(AuthGuard)
export class GetAllUserController {
    constructor(private readonly GetAllUserService: GetAllUserService) { }

    @Get()
    async getAllUser(@Res() res) {
        try {
            const usersResponse = await this.GetAllUserService.getAllUser();
            if (usersResponse.status === true) {
                return res.status(200).send({
                    status: usersResponse.status,
                    message: usersResponse.message,
                    data: usersResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: usersResponse.status,
                    message: usersResponse.message,
                    data: usersResponse.data
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: errorOccurredWhileFetchingUsers,
                error: error.message || error,
            });
        }
    }
}

import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { GetUserByIdService } from '../service/getUserByIdService';
import { ValidateUserId } from '../common/commonValidation';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
@Controller('user/getUserById/:id')
@UseGuards(AuthGuard)
export class GetUserByIdController {
    constructor(private readonly GetUserByIdService: GetUserByIdService) { }
    @Get()
    async getUserById(@Param('id') id: number, @Res() res) {
        try {
            const validationResponse = await ValidateUserId.isUserId(id);
            if (validationResponse && validationResponse.statusCode) {
                return res.status(400).send({
                    status: validationResponse.status,
                    message: validationResponse.message,
                });
            }
            const userResponse = await this.GetUserByIdService.getUserById(id);
            if (userResponse.status === true) {
                return res.status(200).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    data: userResponse.data,
                });
            } else {
                return res.status(400).send({
                    status: userResponse.status,
                    message: userResponse.message,
                    data: userResponse.data,
                    error: userResponse.error,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
                data: null
            });
        }
    }
}

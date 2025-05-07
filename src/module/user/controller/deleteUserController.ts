import { Controller, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { DeleteUserService } from '../service/deleteUserService';
import {
    errorOccurredWhileDeletingTheUser
} from '../common/userMessage';
import { ValidateUserId } from '../common/commonValidation';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('user/deleteUser/:id')
@UseGuards(AuthGuard)
export class DeleteUserController {
    constructor(private readonly DeleteUserService: DeleteUserService) { }
    @Delete()
    async delete(@Param('id') id: number, @Res() res) {
        try {
            const validationResponse = await ValidateUserId.isUserId(id);
            if (validationResponse && validationResponse.statusCode) {
                return res.status(400).json({
                    status: validationResponse.status,
                    message: validationResponse.message,
                });
            }
            const userResponse = await this.DeleteUserService.delete(id);
            if (userResponse.status === true) {
                return res.status(200).json({
                    status: userResponse.status,
                    message: userResponse.message,
                });
            } else {
                return res.status(400).json({
                    status: userResponse.status,
                    message: userResponse.message,
                    error: userResponse.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: errorOccurredWhileDeletingTheUser,
                error: error.message,
            });
        }
    }
}

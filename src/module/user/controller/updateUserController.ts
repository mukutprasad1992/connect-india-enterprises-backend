import { Controller, Post, Get, Param, Body, Delete, Put, Res, UseGuards, Req } from '@nestjs/common';
import { UpdateUserDTO } from '../userDTO/updateUserDTO';
import { UpdateUserService } from '../service/updateUserService';
import { anErrorOccurredWhileUpdatingTheUser } from '../common/userMessage'
import { ValidationUser } from '../common/joiValidationUser';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
@Controller('user/updateUser/:id')
@UseGuards(AuthGuard)
export class UpdateUserController {
    constructor(private readonly UpdateUserService: UpdateUserService) { }
    @Put()
    async updateUser(@Param('id') id: number,
        @Body(new ValidationUser(UpdateUserDTO.userSchema))
        updateUserDTO: UpdateUserDTO,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const updatedUser = await this.UpdateUserService.updateUser(id, updateUserDTO, userId);
            if (updatedUser.status === true) {
                return res.status(200).send({
                    status: updatedUser.status,
                    message: updatedUser.message,
                    data: updatedUser.data,
                });
            } else {
                return res.status(401).send({
                    status: updatedUser.status,
                    message: updatedUser.message,
                    data: updatedUser.data,
                    error: updatedUser.error
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileUpdatingTheUser,
                error: error.message,
                data: null
            });
        }
    }
}
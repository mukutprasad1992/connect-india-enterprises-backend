import { Controller, Put, Body, Res, UseGuards, Req } from '@nestjs/common';
import { UpdateProfileService } from '../service/updateProfileService';
import { UpdateUserDto } from '../profileDTO/updateProfileDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { profileUpdateSuccessfully, profileNotFound, anErrorOccurredWhileUpdatingProfile } from '../common/profileMessage';
import { ValidationUser } from '../common/joiValidationPipe';
@Controller('profile/updateProfile')
export class UpdateProfileController {
    constructor(private readonly updateProfileService: UpdateProfileService) { }
    @UseGuards(AuthGuard)
    @Put()
    async updateProfile(
        @Req() req,
        @Body(new ValidationUser(UpdateUserDto.userSchema)) updateProfileDto: UpdateUserDto,
        @Res() res
    ) {
        try {
            const userId = req.user.id;
            const profileResponse = await this.updateProfileService.updateProfile(userId, updateProfileDto);
            if (profileResponse.status === true) {
                return res.status(200).send({
                    status: profileResponse.status,
                    message: profileUpdateSuccessfully,
                    result: profileResponse.data
                });
            } else {
                return res.status(401).send({
                    status: profileResponse.status,
                    message: profileResponse.message,
                    error: profileResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileUpdatingProfile,
                error: error.message
            });
        }
    }
}

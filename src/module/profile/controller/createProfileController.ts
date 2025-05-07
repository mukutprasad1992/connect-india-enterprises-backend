import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { CreateProfileService } from '../service/createProfileService';
import { CreateProfileDto } from '../profileDTO/createProfileDTO';
import { profileCreateSuccessfully, anErrorOccurredWhileUpdatingTheProfile, userAlreadyHasAProfile } from '../common/profileMessage';  // Common messages
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationProfile } from '../common/joiValidationPipe';

@Controller('profile/createProfile')
export class CreateProfileController {
    constructor(private readonly createProfileService: CreateProfileService) { }
    @UseGuards(AuthGuard)
    @Post()
    async createProfile(
        @Body(new ValidationProfile(CreateProfileDto.profileSchema)) createProfileDto: CreateProfileDto,
        @Res() res,
        @Req() req
    ) {
        try {
            const userId = req.user.id;
            const existingProfile = await this.createProfileService.getProfileByUserId(userId);
            if (existingProfile) {
                return res.status(400).send({
                    status: false,
                    message: userAlreadyHasAProfile,
                    result: null
                });
            }
            const profileResponse = await this.createProfileService.createProfile(userId, createProfileDto);
            if (profileResponse.status === true) {
                return res.status(201).send({
                    status: profileResponse.status,
                    message: profileCreateSuccessfully,
                    result: profileResponse.data
                });
            } else {
                return res.status(400).send({
                    status: profileResponse.status,
                    message: profileResponse.message,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileUpdatingTheProfile,
                error: error.message
            });
        }
    }
}

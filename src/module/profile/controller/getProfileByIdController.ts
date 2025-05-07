import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetProfileByIdService } from '../service/getProfileByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { profileRetrievalSuccessfully, profileNotFound, anErrorOccurredWhileRetrievingProfile } from '../common/profileMessage'; // Common messages

@Controller('profile/getProfileById')
export class GetProfileByIdController {
    constructor(private readonly profileService: GetProfileByIdService) { }
    @UseGuards(AuthGuard)
    @Get()
    async getProfile(@Req() req, @Res() res) {
        try {
            const userId = req.user.id;
            const profileResponse = await this.profileService.getProfileByUserId(userId);

            if (profileResponse.status === true) {
                return res.status(200).send({
                    status: profileResponse.status,
                    message: profileRetrievalSuccessfully,
                    result: profileResponse.data
                });
            } else {
                return res.status(404).send({
                    status: profileResponse.status,
                    message: profileResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileRetrievingProfile,
                error: error.message
            });
        }
    }
}

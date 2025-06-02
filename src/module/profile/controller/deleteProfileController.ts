import { Controller, Delete, Res, UseGuards, Req } from '@nestjs/common';
import { DeleteProfileService } from '../service/deleteProfileService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { profileDeleteSuccessfully, anErrorOccurredWhileDeletingProfile } from '../common/profileMessage';

@Controller('profile/deleteProfile')
export class DeleteProfileController {
    constructor(private readonly deleteProfileService: DeleteProfileService) { }
    @UseGuards(AuthGuard)
    @Delete()
    async deleteProfile(
        @Req() req,
        @Res() res
    ) {
        try {
            const userId = req.user.id;
            const profileResponse = await this.deleteProfileService.deleteProfile(userId);

            if (profileResponse.status === true) {
                return res.status(200).send({
                    status: profileResponse.status,
                    message: profileDeleteSuccessfully,
                    result: null
                });
            } else {
                return res.status(401).send({
                    status: profileResponse.status,
                    message: profileResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileDeletingProfile,
                error: error.message
            });
        }
    }
}

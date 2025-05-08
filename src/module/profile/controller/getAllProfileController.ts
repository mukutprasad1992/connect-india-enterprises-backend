import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { GetAllProfileService } from '../service/getAllProfileService';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { profileRetrievalSuccessfully, anErrorOccurredWhileRetrievingProfiles } from '../common/profileMessage';

@Controller('profile/getAllProfiles')
export class GetAllProfileController {
    constructor(private readonly getAllProfileService: GetAllProfileService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllProfiles(@Res() res, @Req() req) {
        try {
            const profilesResponse = await this.getAllProfileService.getAllProfiles();

            if (profilesResponse.status === true) {
                return res.status(200).send({
                    status: profilesResponse.status,
                    message: profileRetrievalSuccessfully,
                    result: profilesResponse.data
                });
            } else {
                return res.status(400).send({
                    status: profilesResponse.status,
                    message: profilesResponse.error,
                    result: null
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileRetrievingProfiles,
                error: error.message
            });
        }
    }
}

import {
    Controller,
    Delete,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { DeleteProfileImageService } from '../service/deleteProgileImageService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('files')
@UseGuards(AuthGuard)
export class DeleteProfileImageController {
    constructor(
        private readonly deleteProfileImageService: DeleteProfileImageService,
    ) { }

    @Delete('deleteProfileImage')
    async deleteProfileImage(@Req() req, @Res() res) {
        try {
            const userId = req.user.id;

            const result = await this.deleteProfileImageService.deleteProfileImage(userId);

            if (result.status) {
                return res.status(200).json({
                    status: true,
                    message: result.message,
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: result.message,
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                status: false,
                message: error.message || 'An error occurred while deleting the profile image.',
            });
        }
    }
}

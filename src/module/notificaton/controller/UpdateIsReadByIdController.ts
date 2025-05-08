import {
    Controller,
    Put,
    Param,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { UpdateIsReadByIdService } from '../service/updateIsReadByIdService';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { somethingWentWrong } from '../common/notificationMessage';

@Controller('notification/updateisRead')
@UseGuards(AuthGuard)
export class UpdateIsReadByIdController {
    constructor(
        private readonly updateIsReadByIdService: UpdateIsReadByIdService
    ) { }

    @Put('/:id')
    async updateIsReadById(@Param('id') id: number, @Res() res, @Req() req) {
        try {
            const response = await this.updateIsReadByIdService.updateIsReadById(id);

            if (response.status === true) {
                return res.status(200).send({
                    status: true,
                    message: response.message,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: response.message,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: somethingWentWrong,
                error: error.message,
            });
        }
    }
}

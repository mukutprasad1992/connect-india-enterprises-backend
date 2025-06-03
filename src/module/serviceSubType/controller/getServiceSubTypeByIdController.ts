import { Controller, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';
import { anErrorOccurredWhileRetrievingServiceSubType } from '../common/serviceSubTypeMessage';
import { GetServiceSubTypeByIdService } from '../services/getServiceSubTypeByIdService';

@Controller('serviceSubType/getServiceSubTypeById/:id')
export class GetServiceSubTypeByIdController {
    constructor(
        private readonly getServiceSubTypeByIdService: GetServiceSubTypeByIdService,
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getServiceSubTypeById(@Param('id') id: number, @Req() req, @Res() res) {
        try {
            const userId = req.user.id;

            const response = await this.getServiceSubTypeByIdService.getServiceSubTypeById(id);

            if (response.status) {
                return res.status(200).send({
                    status: true,
                    message: response.message,
                    result: response.data,
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: response.message,
                    error: response.error,
                    result: null,
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                error: error.message,
            });
        }
    }
}

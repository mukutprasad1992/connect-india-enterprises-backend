import {
    Controller,
    Put,
    Param,
    Body,
    Res,
    UseGuards,
    Req
} from '@nestjs/common';
import { UpdateServiceTypeByIdService } from '../services/updateServiceTypeByIdServices';
import { UpdateServiceTypeDTO } from '../serviceTypeDTO/updateServiceTypeDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationServiceType } from '../common/joiValidationServiceTypePipe';
import {
    byUserId,
    errorWhileUpdatingServiceTypeServiceTypeId,
    failedToUpdateServiceTypeServiceTypeId,
    requestReceivedUpdateServiceTypeId,
    serviceTypeUpdatedSuccessfully,
    serviceTypeUpdatedSuccessfullyServiceTypeId,
    serviceTypeUpdateError,
} from '../common/serviceTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('serviceType/updateServiceTypeById/:id')
export class UpdateServiceTypeByIdController {
    constructor(
        private readonly updateServiceTypeByIdService: UpdateServiceTypeByIdService,
        private readonly logger: AppLogger,
    ) { }

    @UseGuards(AuthGuard)
    @Put()
    async updateServiceTypeById(
        @Param('id') id: number,
        @Body(new ValidationServiceType(UpdateServiceTypeDTO.getValidationSchema())) updateServiceTypeDto: UpdateServiceTypeDTO,
        @Res() res,
        @Req() req
    ) {
        const userId = req.user.id;

        this.logger.doLog(
            `${requestReceivedUpdateServiceTypeId} ${id} ${byUserId} ${userId}`,
            'success',
        );

        try {
            const updateResponse = await this.updateServiceTypeByIdService.updateServiceTypeById(
                id,
                userId,
                updateServiceTypeDto,
            );

            if (updateResponse.status === true) {
                this.logger.doLog(
                    `${serviceTypeUpdatedSuccessfullyServiceTypeId} ${id}${byUserId} ${userId}`,
                    'success',
                );

                return res.status(200).send({
                    status: updateResponse.status,
                    message: updateResponse.message || serviceTypeUpdatedSuccessfully,
                    data: updateResponse.data,
                });
            } else {
                this.logger.doLog(
                    `${failedToUpdateServiceTypeServiceTypeId} ${id} ${byUserId} ${userId}. Reason: ${updateResponse.message}`,
                    'fail',
                );

                return res.status(400).send({
                    status: false,
                    message: updateResponse.message,
                    error: updateResponse.error,
                    data: null,
                });
            }
        } catch (error) {
            this.logger.doLog(
                `${errorWhileUpdatingServiceTypeServiceTypeId} ${id} ${byUserId} ${userId}. Error: ${error.message}`,
                'fail',
            );

            return res.status(500).send({
                status: false,
                message: serviceTypeUpdateError,
                error: error.message,
            });
        }
    }
}

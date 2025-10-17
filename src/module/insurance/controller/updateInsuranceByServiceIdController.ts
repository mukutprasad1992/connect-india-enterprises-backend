import {
    Controller,
    Put,
    Param,
    Body,
    Res,
    UseGuards,
    Req,
    HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UpdateInsuranceByIdService } from '../service/updateInsuranceService';
import { UpdateInsuranceDTO } from '../insuranceDTO/updateInsuranceDTO';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ValidationInsurance } from '../common/joiValidationInsurance';
import {
    insuranceUpdatedSuccessfully,
    insuranceUpdateError,
    insuranceNotFoundOrValidationFailed,
    updatingInsuranceRecordID,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('insurance/updateInsuranceById')
export class UpdateInsuranceByIdController {
    constructor(
        private readonly updateInsuranceByIdService: UpdateInsuranceByIdService,
        private readonly logger: AppLogger,
    ) { }

    /**
     * @route   PUT /insurance/updateInsuranceById/:id
     * @desc    Update existing insurance details by ID
     * @access  Protected (AuthGuard)
     */
    @UseGuards(AuthGuard)
    @Put(':id')
    async updateInsuranceById(
        @Param('id') id: number,
        @Body(new ValidationInsurance(UpdateInsuranceDTO.getValidationSchema()))
        updateInsuranceDTO: UpdateInsuranceDTO,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.id;

        this.logger.doLog(
            `${updatingInsuranceRecordID} ${id} for user: ${userId}`,
            'info',
        );

        try {
            const updateResponse =
                await this.updateInsuranceByIdService.updateInsuranceById(
                    id,
                    userId,
                    updateInsuranceDTO,
                );

            // ✅ Success
            if (updateResponse.status === true) {
                this.logger.doLog(
                    `${insuranceUpdatedSuccessfully} (insuranceId: ${id}, userId: ${userId})`,
                    'success',
                );

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: updateResponse.message,
                    data: updateResponse.data,
                });
            }

            // ❌ Not Found or Validation Failed
            this.logger.doLog(
                `${insuranceNotFoundOrValidationFailed} (insuranceId: ${id}, userId: ${userId})`,
                'warn',
            );

            return res.status(400).send({
                status: false,
                message: updateResponse.message,
                error: updateResponse.error || null,
                data: null,
            });
        } catch (error) {
            // 🚨 Unexpected Error
            this.logger.doLog(
                `${insuranceUpdateError} (insuranceId: ${id}, userId: ${userId}): ${error.message}`,
                'error',
            );

            return res.status(500).send({
                status: false,
                message: insuranceUpdateError,
                error: error.message,
            });
        }
    }
}

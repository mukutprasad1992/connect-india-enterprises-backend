import {
    Controller,
    Delete,
    Param,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { DeleteInsuranceByIdService } from '../service/deleteInsuranceByIdService';
import {
    insuranceDeletionError,
    insuranceDeletedSuccessfully,
    insuranceDeletionStarted,
    insuranceNotFoundForDeletion,
} from '../common/insuranceMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Controller('insurance/deleteInsuranceById')
export class DeleteInsuranceByIdController {
    constructor(
        private readonly deleteInsuranceByIdService: DeleteInsuranceByIdService,
        private readonly logger: AppLogger,
    ) { }

    /**
     * @route   DELETE /insurance/deleteInsuranceById/:id
     * @desc    Deletes an insurance record by ID for the authenticated user
     * @access  Protected (AuthGuard)
     */
    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteInsuranceById(
        @Param('id') id: number,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.id;

        this.logger.doLog(
            `${insuranceDeletionStarted} (Insurance ID: ${id}, User ID: ${userId})`,
            'info',
        );

        try {
            const deleteResponse = await this.deleteInsuranceByIdService.deleteInsuranceById(
                id,
                userId,
            );

            // ✅ Successful Deletion
            if (deleteResponse.status === true) {
                this.logger.doLog(
                    `${insuranceDeletedSuccessfully} (Insurance ID: ${id}, User ID: ${userId})`,
                    'success',
                );

                return res.status(200).send({
                    status: true,
                    message: deleteResponse.message,
                    data: null,
                });
            }

            // ❌ Not Found or Already Deleted
            this.logger.doLog(
                `${insuranceNotFoundForDeletion} (Insurance ID: ${id}, User ID: ${userId})`,
                'warn',
            );

            return res.status(400).send({
                status: false,
                message: deleteResponse.message,
                data: null,
            });
        } catch (error) {
            // 🚨 Unexpected Server Error
            this.logger.doLog(
                `${insuranceDeletionError} (Insurance ID: ${id}, User ID: ${userId}): ${error.message}`,
                'error',
            );

            return res.status(500).send({
                status: false,
                message: insuranceDeletionError,
                error: error.message,
            });
        }
    }
}

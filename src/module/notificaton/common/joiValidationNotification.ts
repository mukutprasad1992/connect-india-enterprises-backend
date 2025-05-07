import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateNotificationDTO } from '../notificationDTO/createNotificationDTO';

@Injectable()
export class JoiValidationNotification implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const { error } = CreateNotificationDTO.notificationSchema.validate(value);

        if (error) {
            let errorMessage = error.details[0].message;
            errorMessage = errorMessage.replace(/"([^"]*)"/g, '$1');
            errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

            throw new BadRequestException({
                statusCode: 400,
                message: errorMessage,
            });
        }

        return value;
    }
}

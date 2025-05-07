import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateCustomerDTO } from '../customerDTO/createCustomerDTO'; // Import your DTO

@Injectable()
export class JoiValidationCustomer implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const { error } = CreateCustomerDTO.customerSchema.validate(value);

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

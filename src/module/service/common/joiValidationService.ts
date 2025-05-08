import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import * as Joi from "joi";
import { inputCannotBeUndefinedOrNull, invalidType } from "./serviceMessage";

@Injectable()
export class ValidationService implements PipeTransform {
    constructor(private readonly schema: Joi.ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null) {
            throw new BadRequestException({
                statusCode: 400,
                message: inputCannotBeUndefinedOrNull
            });
        }

        const { error } = this.schema.validate(value);
        if (error) {
            let errorMessage = error.details[0].message;
            errorMessage = errorMessage.replace(/"([^"]*)"/g, '$1');
            errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

            throw new BadRequestException({
                statusCode: 400,
                errors: errorMessage,
            });
        }

        return value;
    }
}

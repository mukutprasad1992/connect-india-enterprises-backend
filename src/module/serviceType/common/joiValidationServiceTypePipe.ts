import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import * as Joi from "joi";
import { inputCannotBeUndefinedOrNull, invalidAmount, invalidDuration, invalidStatus, invalidType } from "./serviceTypeMessage";

@Injectable()
export class ValidationServiceType implements PipeTransform {
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

            if (errorMessage.includes("amount")) {
                errorMessage = invalidAmount;
            } else if (errorMessage.includes("type")) {
                errorMessage = invalidType;
            } else if (errorMessage.includes("duration")) {
                errorMessage = invalidDuration;
            } else if (errorMessage.includes("status")) {
                errorMessage = invalidStatus;
            }

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

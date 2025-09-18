import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';
import {
    inputCannotBeUndefinedOrNull,
    requestBodyIsRequired,
    requestBodyMustBeAJSONObject,
    validationFailed,
} from './loanMessage';

@Injectable()
export class ValidationLoan implements PipeTransform {
    constructor(private readonly schema: Joi.ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null) {
            throw new BadRequestException({
                status: false,
                message: inputCannotBeUndefinedOrNull,
                errors: {
                    body: requestBodyIsRequired
                }
            });
        }
        if (typeof value !== 'object' || Array.isArray(value)) {
            throw new BadRequestException({
                status: false,
                message: validationFailed,
                errors: {
                    body: requestBodyMustBeAJSONObject
                }
            });
        }
        const { error, value: validatedValue } = this.schema.validate(value, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.reduce((acc, detail) => {
                const key = detail.path[0] ?? 'body';
                let message = detail.message.replace(/"/g, '');
                acc[key] = message;
                return acc;
            }, {});

            throw new BadRequestException({
                status: false,
                message: validationFailed,
                errors: errorDetails
            });
        }

        return validatedValue;
    }
}
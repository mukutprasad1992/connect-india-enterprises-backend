import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';
import {
    inputCannotBeUndefinedOrNull,
} from './serviceTypeMessage';

@Injectable()
export class ValidationServiceType implements PipeTransform {
    constructor(private readonly schema: Joi.ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null) {
            throw new BadRequestException({
                status: false,
                message: inputCannotBeUndefinedOrNull,
                errors: {
                    body: 'Request body is required'
                }
            });
        }
        if (typeof value !== 'object' || Array.isArray(value)) {
            throw new BadRequestException({
                status: false,
                message: 'Validation failed',
                errors: {
                    body: 'Request body must be a JSON object'
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
                message: 'Validation failed',
                errors: errorDetails
            });
        }

        return validatedValue;
    }
}
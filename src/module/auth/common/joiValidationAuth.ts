import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import Joi from 'joi';
import {
    AuthValidationMessages,
    failsToMatchTheRequiredPattern,
    inputCannotBeUndefinedOrNull,
    isRequired,
    mustBeAtLeast,
    mustBeAValidEmail,
    mustNotExceed
} from '../common/authMessage';

@Injectable()
export class JoiValidationAuth implements PipeTransform {
    constructor(private readonly schema: Joi.ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (value == null || typeof value !== 'object' || Object.keys(value).length === 0) {
            throw new BadRequestException({ status: false, errors: inputCannotBeUndefinedOrNull });
        }
    
        const { error } = this.schema.validate(value, { abortEarly: false });
        if (error) {
            const fieldMap: Record<string, any> = {
                email: AuthValidationMessages.email,
                password: AuthValidationMessages.password,
                newPassword: AuthValidationMessages.newPassword,
                oldPassword: AuthValidationMessages.oldPassword,
            };
            let errorMessage = error.details
                .map(({ message, context }) => {
                    const fieldKey = context?.key;
                    if (fieldKey && fieldMap[fieldKey]) {
                        if (message.includes(isRequired)) return fieldMap[fieldKey].required;
                        if (message.includes(mustBeAValidEmail)) return fieldMap[fieldKey].email;
                        if (message.includes(mustBeAtLeast)) return fieldMap[fieldKey].min;
                        if (message.includes(mustNotExceed)) return fieldMap[fieldKey].max;
                        if (message.includes(failsToMatchTheRequiredPattern)) return fieldMap[fieldKey].pattern;
                    }
                    return message.replace(/"([^"]*)"/g, '$1');
                })
                .shift();
            throw new BadRequestException({ status: false, errors: errorMessage });
        }
    
        return value;
    }
    
    
}

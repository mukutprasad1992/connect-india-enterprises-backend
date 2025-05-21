import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {

    private readonly schema = Joi.object({

        mediaType: Joi.string().valid('image', 'video', 'document').required(),
        description: Joi.string().optional(),
    });

    transform(value: any, metadata: ArgumentMetadata) {
        const { error } = this.schema.validate(value);
        if (error) throw new BadRequestException(error.details[0].message);
        return value;
    }
}

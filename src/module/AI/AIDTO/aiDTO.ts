import { IsString } from 'class-validator';

export class AiDTO {
    @IsString()
    message: string;
}
import { Module } from '@nestjs/common';
import { FileController } from '../controller/uploadFileController';
import { FileUploadService } from '../../file/service/fileUploadService';

@Module({
    controllers: [FileController],
    providers: [FileUploadService],
})
export class FileModule { }

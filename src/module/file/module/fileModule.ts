import { Module } from '@nestjs/common';
import { FileController } from '../controller/uploadFileController';
import { FileUploadService } from '../../file/service/fileUploadService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { GetUserByIdService } from 'src/module/user/service/getUserByIdService';
import { UserSchema } from 'src/module/user/userEntity/userSchema';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserSchema]),
        TypeOrmModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [FileController],
    providers: [
        FileUploadService,
        GetUserByIdService
    ],
})
export class FileModule { }

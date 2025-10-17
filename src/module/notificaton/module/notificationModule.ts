import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationController } from '../controller/createNotificationController';
import { CreateNotificationService } from '../service/createNotificationService';
import { NotificationSchema } from '../notificationEntity/notificationEntity';
import { GetAllNotificationService } from '../service/getAllNotificationService';
import { GetAllNotificationController } from '../controller/getAllNotificationController';
import { UpdateIsReadByIdService } from '../service/updateIsReadByIdService';
import { UpdateIsReadByIdController } from '../controller/UpdateIsReadByIdController';
import { GetAllUserNotificationService } from '../service/getAllUserNotificationService';
import { GetAllUserNotificationController } from '../controller/getAllUserNotificationController';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationSchema, UserSchema]),
        TypeOrmModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [
        CreateNotificationController,
        GetAllNotificationController,
        UpdateIsReadByIdController,
        GetAllUserNotificationController,
    ],
    providers: [
        AppLogger,
        CreateNotificationService,
        GetAllNotificationService,
        UpdateIsReadByIdService,
        GetAllUserNotificationService,
    ],
    exports: [CreateNotificationService],
})
export class NotificationModule { }

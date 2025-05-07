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
import { GetNotificationsByVendorIdController } from '../controller/getNotificationByVendorIdController';
import { GetNotificationsByVendorIdService } from '../service/getNotificationByVendorIdService';
import { GetAllAdminNotificationService } from '../service/getAllAdminNotificationService';
import { GetAllAdminNotificationController } from '../controller/getAllAdminNotificationController';
import { GetNotificationsByUserIdController } from '../controller/getAllNotificationByUserIdController';
import { GetAllNotificationByUserIdService } from '../service/getAllNotificationByUserIdService';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationSchema]),
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
        GetNotificationsByVendorIdController,
        GetAllAdminNotificationController,
        GetNotificationsByUserIdController,
    ],
    providers: [
        CreateNotificationService,
        GetAllNotificationService,
        UpdateIsReadByIdService,
        GetNotificationsByVendorIdService,
        GetAllAdminNotificationService,
        GetAllNotificationByUserIdService,
    ],
    exports: [CreateNotificationService],
})
export class NotificationModule { }

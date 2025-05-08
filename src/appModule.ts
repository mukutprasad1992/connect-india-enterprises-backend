import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user/module/userModule';
import { databaseConfig } from './config/databaseConfig';
import { AuthModule } from './module/auth/module/authModule';
import { ServiceSubTypeModule } from './module/serviceSubType/module/serviceSubTypeModule';
import { ServiceTypeModule } from './module/serviceType/module/serviceTypeModule';
import { ServiceModule } from './module/service/module/serviceModule';
import { CustomerModule } from './module/customer/module/customerModule';
import { VoucherModule } from './module/voucher/module/voucherModule';
import { AiModule } from './module/AI/module/AIModule';
import { NotificationModule } from './module/notificaton/module/notificationModule';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule,
        UserModule,
        AuthModule,
        ServiceSubTypeModule,
        ServiceTypeModule,
        ServiceModule,
        CustomerModule,
        VoucherModule,
        AiModule,
        NotificationModule,
    ],
})
export class AppModule { }

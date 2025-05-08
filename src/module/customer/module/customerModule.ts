import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { CustomerSchema } from '../customerEntity/customerEntity';
import { CreateCustomerService } from '../service/createCustomerService';
import { CreateCustomerController } from '../controller/createCustomerController';
import { GetCustomerByVendorController } from '../controller/getCustomerByVendorController';
import { GetAllCustomersByVenderService } from '../service/getCustomerByvedorService';
import { UpdateCustomerService } from '../service/updateCustomerService';
import { UpdateCustomerController } from '../controller/updateCustomerByIdController';
import { DeleteCustomerByIdService } from '../service/deleteCustomerService';
import { DeleteCustomerByIdController } from '../controller/deleteCustomerByIdController';
import { GetAllCustomersByVenderIdService } from '../service/getAllCustomerByVenderIdService';
import { GetCustomerByVendorIdController } from '../controller/getAllCustomerByvenderIdController';
import { GetAllCustomerService } from '../service/getAllCustomerService';
import { GetAllCustomerController } from '../controller/getAllCustomerController';
import { NotificationModule } from 'src/module/notificaton/module/notificationModule';
import { NotificationCustomerService } from '../common/template/notificationCreateCustomerMessageTemelate';
import { UpdateNotificationCustomerService } from '../common/template/notificationUpdateCustomerMessage';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerSchema]),
        TypeOrmModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
        NotificationModule,
    ],
    controllers: [
        CreateCustomerController,
        GetCustomerByVendorController,
        UpdateCustomerController,
        DeleteCustomerByIdController,
        GetCustomerByVendorIdController,
        GetAllCustomerController,
    ],
    providers: [
        AuthGuard,
        CreateCustomerService,
        GetAllCustomersByVenderService,
        UpdateCustomerService,
        DeleteCustomerByIdService,
        GetAllCustomersByVenderIdService,
        GetAllCustomerService,
        NotificationCustomerService,
        UpdateNotificationCustomerService,
    ],
})
export class CustomerModule { }

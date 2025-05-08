import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceSchema } from '../serviceEntity/serviceEntity';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { CreateServiceController } from '../controller/createServiceController';
import { CreateServiceService } from '../services/createServiceServices';
import { GetALLServiceByIdmentService } from '../services/getAllServiceServices';
import { GetAllServicesController } from '../controller/getAllServiceController';
import { GetServiceByIdService } from '../services/getServiceByIdServise';
import { GetServiceByIdController } from '../controller/getServiceByIdController';
import { UpdateServiceByIdService } from '../services/updateServiceByIdServices';
import { UpdateServiceByIdController } from '../controller/updateServiceByIdController';
import { DeleteServiceByIdService } from '../services/deleteServiceByIdServices';
import { DeleteServiceByIdController } from '../controller/deleteServiceByIdControoler';

@Module({
    imports: [
        TypeOrmModule.forFeature([ServiceSchema]),
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
        CreateServiceController,
        GetAllServicesController,
        GetServiceByIdController,
        UpdateServiceByIdController,
        DeleteServiceByIdController,
    ],
    providers: [
        AuthGuard,
        CreateServiceService,
        GetALLServiceByIdmentService,
        GetServiceByIdService,
        UpdateServiceByIdService,
        DeleteServiceByIdService,
    ],
})
export class ServiceModule { }

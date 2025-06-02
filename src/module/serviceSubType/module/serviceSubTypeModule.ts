import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { ServiceSubTypeSchema } from '../serviceSubTypeEntity/serviceSubTypeEntity';
import { CreateServiceSubTypeService } from '../services/createServiceSubTypeService';
import { CreateServiceSubTypeController } from '../controller/createServiceSubTypeController';
import { GetAllServiceSubTypeService } from '../services/gatAllServiceSubTypeService';
import { GetAllServiceSubTypeController } from '../controller/getAllServiceSubTypeController';
import { GetServiceSubTypeByIdService } from '../services/getServiceSubTypeByIdService';
import { GetServiceSubTypeByIdController } from '../controller/getServiceSubTypeByIdController';
import { UpdateServiceSubTypeByIdService } from '../services/updateServiceSubTypeBYIdService';
import { UpdateServiceSubTypeByIdController } from '../controller/updateServiceSubTypeByIdController';
import { DeleteServiceSubTypeByIdService } from '../services/deleteServiceSubTypeService';
import { DeleteServiceSubTypeByIdController } from '../controller/deleteServiceSubTypeController';
import { GetServiceSubTypeByServiceIdService } from '../services/getAllServiceSubTypeByServiceIdService';
import { GetServiceSubTypeByServiceIdController } from '../controller/getAllServiceSubTypeByServiceIdController';

@Module({
    imports: [
        TypeOrmModule.forFeature([ServiceSubTypeSchema]),
        TypeOrmModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [
        CreateServiceSubTypeController,
        GetAllServiceSubTypeController,
        GetServiceSubTypeByIdController,
        UpdateServiceSubTypeByIdController,
        DeleteServiceSubTypeByIdController,
        // GetServiceSubTypeByServiceIdController,
    ],
    providers: [
        AuthGuard,
        CreateServiceSubTypeService,
        GetAllServiceSubTypeService,
        GetServiceSubTypeByIdService,
        UpdateServiceSubTypeByIdService,
        DeleteServiceSubTypeByIdService,
        // GetServiceSubTypeByServiceIdService,
    ],
    exports: [
        CreateServiceSubTypeService,
    ],
})
export class ServiceSubTypeModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from '../../../midlewares/authenticationMiddleware';

import { ServiceSubTypeSchema } from '../serviceSubTypeEntity/serviceSubTypeEntity';

import { CreateServiceSubTypeController } from '../controller/createServiceSubTypeController';
import { GetAllServiceSubTypeController } from '../controller/getAllServiceSubTypeController';
import { UpdateServiceSubTypeByIdController } from '../controller/updateServiceSubTypeByIdController';
import { DeleteServiceSubTypeByIdController } from '../controller/deleteServiceSubTypeController';
import { GetServiceSubTypeByServiceIdController } from '../controller/getAllServiceSubTypeByServiceIdController';
import { CreateServiceSubTypeService } from '../services/createServiceSubTypeService';
import { GetAllServiceSubTypeService } from '../services/gatAllServiceSubTypeService';
import { UpdateServiceSubTypeByIdService } from '../services/updateServiceSubTypeBYIdService';
import { DeleteServiceSubTypeByIdService } from '../services/deleteServiceSubTypeService';
import { GetServiceSubTypeByServiceIdService } from '../services/getAllServiceSubTypeByServiceIdService';
import { GetByServiceSubTypeByIdController } from '../controller/getByServiceSubTypeIdController';
import { GetByServiceSubTypeIdService } from '../services/getByServiceSubTypeIdService'
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
        UpdateServiceSubTypeByIdController,
        DeleteServiceSubTypeByIdController,
        GetServiceSubTypeByServiceIdController,
        GetByServiceSubTypeByIdController,
    ],
    providers: [
        AuthGuard,
        CreateServiceSubTypeService,
        GetAllServiceSubTypeService,
        UpdateServiceSubTypeByIdService,
        DeleteServiceSubTypeByIdService,
        GetServiceSubTypeByServiceIdService,
        GetByServiceSubTypeIdService,
    ],
    exports: [CreateServiceSubTypeService],
})
export class ServiceSubTypeModule { }

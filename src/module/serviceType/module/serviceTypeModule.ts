import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ServiceTypeSchema } from '../serviceTypeEntity/serviceTypeEntity';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { CreateServiceTypeController } from '../controller/createServiceTypeController';
import { GetAllServiceTypesController } from '../controller/getAllServiceTypeController';
import { GetServiceTypeByIdController } from '../controller/getServiceTypeByIdController';
import { UpdateServiceTypeByIdController } from '../controller/updateServiceTypeByIdController';
import { DeleteServiceTypeByIdController } from '../controller/deleteServiceTypeByIdControoler';
import { GetServiceTypeByServiceServiceIdController } from '../controller/getAllServiceTypeByServiceIdController';
import { UpdateServiceTypeStatusController } from '../controller/updateServiceTypeStatusController';
import { GetTotalAmountByUserIdServiceTypeController } from '../controller/getTotalAmountByIdSericeTypeController';
import { GetTotalAmountServiceTypeController } from '../controller/getAllAmountServiceTypeController';
import { CreateServiceTypeService } from '../services/createServiceTypeServices';
import { GetALLServiceTypeByIdService } from '../services/getAllServiceTypeServices';
import { GetServiceTypeByIdService } from '../services/getServiceTypeByIdServise';
import { UpdateServiceTypeByIdService } from '../services/updateServiceTypeByIdServices';
import { DeleteServiceTypeByIdService } from '../services/deleteServiceTypeByIdServices';
import { GetServiceTypeByServiceIdService } from '../services/getAllServiceTypeByServiceId';
import { UpdateServiceTypeStatusService } from '../services/updateServiseTypeStatusService';
import { GetTotalAmountByUserIdServiceTypeService } from '../services/getTotalAmountByServiseTypeIdService';
import { GetTotalAmountServiceTypeService } from '../services/getAllAmountServiceTypeService';
import { NotificationModule } from '../../notificaton/module/notificationModule';
import { NotificationMailService } from 'src/utils/mailer/notificatiomMail';
import { ConfigModule } from '@nestjs/config';
import { MessageGeneratorService } from '../common/template/serviceStatusMessageTemplate';
import { CreatedServiceSuccessMessageService } from '../common/template/serviceTypeCreatedNotificationMessagetemplate';
import { ServiceTypeMailService } from 'src/utils/mailer/ServiceTypeMailer';
import { UpdatedServiceMessageService } from '../common/template/serviceTypeUpdateNotificationMessageTemplate';
import { GetTotalAmountAndServicesByUserIdServiceTypeController } from '../controller/getTotalAmountsAndServicesByUserIdController';
import { GetTotalAmountsAndServicesByUserIdServiceTypeService } from '../services/getTotalAmountsAndServicesByUserIdService';
import { DeleteServiceTypeByUserSendMailService } from 'src/utils/mailer/deleteServiceTypeByUserSendMail';
import { DeletedServiceRequestNotificationService } from '../common/template/DeletedUserNotificationMessage';
import { UpdateServiceTypeByUserMailService } from 'src/utils/mailer/updateServiceTypeByUserMailService';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([ServiceTypeSchema, UserSchema]),
        TypeOrmModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        NotificationModule,
    ],
    controllers: [
        CreateServiceTypeController,
        GetAllServiceTypesController,
        GetServiceTypeByIdController,
        UpdateServiceTypeByIdController,
        DeleteServiceTypeByIdController,
        GetServiceTypeByServiceServiceIdController,
        UpdateServiceTypeStatusController,
        GetTotalAmountByUserIdServiceTypeController,
        GetTotalAmountServiceTypeController,
        GetTotalAmountAndServicesByUserIdServiceTypeController,

    ],
    providers: [
        AuthGuard,
        NotificationMailService,
        CreateServiceTypeService,
        GetALLServiceTypeByIdService,
        GetServiceTypeByIdService,
        UpdateServiceTypeByIdService,
        DeleteServiceTypeByIdService,
        GetServiceTypeByServiceIdService,
        UpdateServiceTypeStatusService,
        GetTotalAmountByUserIdServiceTypeService,
        GetTotalAmountServiceTypeService,
        MessageGeneratorService,
        CreatedServiceSuccessMessageService,
        ServiceTypeMailService,
        UpdatedServiceMessageService,
        GetTotalAmountsAndServicesByUserIdServiceTypeService,
        DeleteServiceTypeByUserSendMailService,
        DeletedServiceRequestNotificationService,
        UpdateServiceTypeByUserMailService
    ]
})
export class ServiceTypeModule { }

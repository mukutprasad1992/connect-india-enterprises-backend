import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { InsuranceSchema } from '../insuranceEntity/insuranceEntity';
import { NotificationModule } from '../../notificaton/module/notificationModule';
import { NotificationMailService } from 'src/utils/mailer/notificatiomMail';
import { ConfigModule } from '@nestjs/config';
import { CreateInsuranceController } from '../controller/createInsuranceController';
import { CreateInsuranceService } from '../service/createInsuranceService';
import { InsuranceMailService } from 'src/utils/mailer/insuranceMailer';
import { GetAllInsuranceByServiceServiceIdController } from '../controller/getAllInsuranceByserviceIdcontroller';
import { GetInsuranceByServiceIdService } from '../service/getAllInsuranceByservice';
import { UpdateInsuranceByIdController } from '../controller/updateInsuranceByServiceIdController';
import { UpdateInsuranceByIdService } from '../service/updateInsuranceService';
import { DeleteInsuranceByIdController } from '../controller/deleteInsuranceByIdController';
import { DeleteInsuranceByIdService } from '../service/deleteInsuranceByIdService';
import { DeleteServiceTypeByUserSendMailService } from 'src/utils/mailer/deleteServiceTypeByUserSendMail';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([InsuranceSchema, UserSchema]),
        TypeOrmModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        NotificationModule,
    ],
    controllers: [
        CreateInsuranceController,
        GetAllInsuranceByServiceServiceIdController,
        UpdateInsuranceByIdController,
        DeleteInsuranceByIdController

    ],
    providers: [
        AuthGuard,
        NotificationMailService,
        CreateInsuranceService,
        InsuranceMailService,
        GetInsuranceByServiceIdService,
        UpdateInsuranceByIdService,
        DeleteInsuranceByIdService,
        DeleteServiceTypeByUserSendMailService
    ]
})
export class InsuranceModule { }

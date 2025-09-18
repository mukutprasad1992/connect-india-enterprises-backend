import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from '../../user/userEntity/userSchema';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { NotificationModule } from '../../notificaton/module/notificationModule';
import { NotificationMailService } from 'src/utils/mailer/notificatiomMail';
import { ConfigModule } from '@nestjs/config';
import { DeleteServiceTypeByUserSendMailService } from 'src/utils/mailer/deleteServiceTypeByUserSendMail';
import { LoanSchema } from '../loanEntity/loanEntity';
import { CreateLoanController } from '../controller/createLoanController';
import { CreateLoanService } from '../services/createLoanService';
import { GetAllLoanByServiceServiceIdController } from '../controller/getAllLoanByIdControler';
import { GetloanByServiceIdService } from '../services/getAllLoanByIdservice';
import { LoanMailService } from 'src/utils/mailer/loanMailer';
import { UpdateLoanByIdController } from '../controller/updateLoanServiceByIdController';
import { UpdateLoanByIdService } from '../services/updateLoanByIdService';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([LoanSchema, UserSchema]),
        TypeOrmModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        NotificationModule,
    ],
    controllers: [
        CreateLoanController,
        GetAllLoanByServiceServiceIdController,
        UpdateLoanByIdController
    ],
    providers: [
        AuthGuard,
        NotificationMailService,
        LoanMailService,
        DeleteServiceTypeByUserSendMailService,
        CreateLoanService,
        GetloanByServiceIdService,
        UpdateLoanByIdService
    ]
})
export class LoanModule { }

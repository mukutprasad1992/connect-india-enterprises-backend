import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { VoucherSchema } from '../voucherEntity/voucherRecordSchema';
import { CreateVoucherController } from '../controller/createVoucherController';
import { CreateVoucherService } from '../service/createVoucherService';
import { GetAllVoucherService } from '../service/getAllVocherService';
import { GetAllVoucherController } from '../controller/getAllVoucherController';
import { GetVoucherByIdService } from '../service/getVoucherByIdService';
import { GetVoucherByIdController } from '../controller/getVoucherByIdController';
import { VoucherMailService } from 'src/utils/mailer/voucherMail';

import { ConfigModule } from '@nestjs/config';
import { UpdateVoucherService } from '../service/updateVoucherByIdService';
import { UpdateVoucherByIdController } from '../controller/updateVoucherByIdController';
import { DeleteVoucherByIdService } from '../service/deleteVoucherByIdService';
import { DeleteVoucherByIdController } from '../controller/deleteVoucherByIdController';
import { GetAllVouchersByVendorIdService } from '../service/getAllVoucherByVendorIdService';
import { GetAllVoucherByVendorIdController } from '../controller/getAllVoucherByVendorIdController';
import { UpdateVoucherStatusService } from '../service/updateStatusVoucherService';
import { UpdateVoucherStatusByIdController } from '../controller/updateVoucherStatusController';
import { NotificationModule } from 'src/module/notificaton/module/notificationModule';
import { SuccessVoucherMessageService } from '../common/template/voucherNotificationSuccessMessageTemplate';

@Module({
    imports: [
        TypeOrmModule.forFeature([VoucherSchema]),
        TypeOrmModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        ConfigModule.forRoot(),
        NotificationModule
    ],
    controllers: [
        CreateVoucherController,
        GetAllVoucherController,
        GetVoucherByIdController,
        UpdateVoucherByIdController,
        DeleteVoucherByIdController,
        GetAllVoucherByVendorIdController,
        UpdateVoucherStatusByIdController,

    ],
    providers: [
        AuthGuard,
        CreateVoucherService,
        GetAllVoucherService,
        GetVoucherByIdService,
        UpdateVoucherService,
        VoucherMailService,
        DeleteVoucherByIdService,
        GetAllVouchersByVendorIdService,
        UpdateVoucherStatusService,
        SuccessVoucherMessageService

    ],
})
export class VoucherModule { }

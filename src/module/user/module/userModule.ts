import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserCreateService } from '../service/createUserService';
import { GetAllUserService } from '../service/getAllUserService';
import { GetUserByIdService } from '../service/getUserByIdService';
import { UpdateUserService } from '../service/updateUserService';
import { DeleteUserService } from '../service/deleteUserService';
import { CreateUserController } from '../controller/createUserController';
import { GetAllUserController } from '../controller/getAllUserController';
import { GetUserByIdController } from '../controller/getUserByIdController';
import { UpdateUserController } from '../controller/updateUserController';
import { DeleteUserController } from '../controller/deleteUserController';
import { UserSchema } from '../userEntity/userSchema';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { GetAllVendorService } from '../service/getAllvendorService';
import { GetAllVendorController } from '../controller/getAllVendorsController';
import { MailService } from 'src/utils/mailer/authMailer';

import { ConfigModule } from '@nestjs/config';
import { UpdateUserStatusService } from '../service/updateUserStatusService';
import { UpdateUserStatusByIdController } from '../controller/updateUserStatuscontroller';
import { VendorBlockOrUnblockMailService } from 'src/utils/mailer/vendorBlockOrUnblockMail';
import { AppLogger } from 'src/utils/common/loggerService';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    TypeOrmModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [
    CreateUserController,
    GetAllUserController,
    GetUserByIdController,
    UpdateUserController,
    DeleteUserController,
    GetAllVendorController,
    UpdateUserStatusByIdController,
  ],
  providers: [
    AppLogger,
    UserCreateService,
    GetAllUserService,
    GetUserByIdService,
    UpdateUserService,
    DeleteUserService,
    GetAllVendorService,
    UpdateUserStatusService,
    AuthGuard,
    MailService,
    VendorBlockOrUnblockMailService,
  ],
})
export class UserModule {}

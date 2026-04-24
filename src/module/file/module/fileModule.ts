import { Module } from '@nestjs/common';
import { ProfileImageUploadController } from '../controller/profileImageUploadController';
import { ProfileImageUploadService } from '../service/profileImageUploadService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { GetUserByIdService } from 'src/module/user/service/getUserByIdService';
import { UserSchema } from 'src/module/user/userEntity/userSchema';
import { CouponPDFFileController } from '../controller/uploadCouponPDFController';
import { UploadCouponPDFService } from '../service/uploadCouponPDfService';
import { DeleteProfileImageService } from '../service/deleteProfileImageService';
import { DeleteProfileImageController } from '../controller/deleteProfileImageController';
import { UploadDocumentForServiceTypeByUserService } from '../service/uploadDocumnetForServiceTypeByUserService';
import { UploadDocumentForServiceTypeByUserController } from '../controller/uploadDocumentForServiceTypeByUserController';
import { AppLogger } from 'src/utils/common/loggerService';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
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
    ProfileImageUploadController,
    CouponPDFFileController,
    DeleteProfileImageController,
    UploadDocumentForServiceTypeByUserController,
  ],
  providers: [
    AppLogger,
    ProfileImageUploadService,
    GetUserByIdService,
    UploadCouponPDFService,
    DeleteProfileImageService,
    UploadDocumentForServiceTypeByUserService,
  ],
  exports: [UploadCouponPDFService],
})
export class FileModule {}

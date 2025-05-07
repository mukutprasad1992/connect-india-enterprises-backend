import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSchema } from '../../user/userEntity/userSchema';
import { LoginService } from '../service/authLoginService';
import { ChangePasswordService } from '../service/authChangePasswordService';
import { ForgetPasswordService } from '../service/authForgetPasswordService';
import { ResetPasswordService } from '../service/authResetPasswordService';
import { LoginController } from '../controller/authLoginController';
import { ChangePasswordController } from '../controller/authChangePasswordController';
import { ForgetPasswordController } from '../controller/authForgetPasswordController';
import { ResetPasswordController } from '../controller/authResetPasswordControoler';
import { MailService } from '../../../utils/mailer/authMailer';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserSchema]),
        TypeOrmModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [
        LoginController,
        ChangePasswordController,
        ForgetPasswordController,
        ResetPasswordController,
    ],
    providers: [
        MailService,
        LoginService,
        ChangePasswordService,
        ForgetPasswordService,
        ResetPasswordService,
    ],
})
export class AuthModule { }

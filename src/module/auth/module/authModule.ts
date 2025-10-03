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
import { GoogleStrategy } from 'src/utils/googleStrategy';
import { FacebookStrategy } from 'src/utils/facebookStrategy';
import { JwtAuthGuard } from 'src/midlewares/JwtAuthGuard';
import { FacebookAuthController } from '../controller/facebookAuthController';
import { GoogleAuthController } from '../controller/googleAuthController';
import { FacebookAuthService } from '../service/facebookAuthService';
import { GoogleAuthService } from '../service/googleAuthService';
import { AppLogger } from 'src/utils/common/loggerService';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserSchema]),
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
        FacebookAuthController,
        GoogleAuthController,
        ChangePasswordController,
        ForgetPasswordController,
        ResetPasswordController,
    ],
    providers: [
        AppLogger,
        MailService,
        LoginService,
        GoogleStrategy,
        FacebookAuthService,
        GoogleAuthService,
        FacebookStrategy,
        ChangePasswordService,
        ForgetPasswordService,
        ResetPasswordService,
        JwtAuthGuard
    ],
    exports: [JwtAuthGuard],
})
export class AuthModule { }

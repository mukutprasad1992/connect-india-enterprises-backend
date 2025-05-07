import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ProfileSchema } from '../profileEntity/profileSchema';
import { AuthGuard } from '../../../midlewares/authenticationMiddleware';
import { CreateProfileController } from '../controller/createProfileController'
import { CreateProfileService } from '../service/createProfileService'
import { GetAllProfileService } from '../service/getAllProfileService';
import { GetAllProfileController } from '../controller/getAllProfileController';
import { GetProfileByIdService } from '../service/getProfileByIdService';
import { GetProfileByIdController } from '../controller/getProfileByIdController';
import { UpdateProfileService } from '../service/updateProfileService';
import { UpdateProfileController } from '../controller/updateProfileController';
import { DeleteProfileService } from '../service/deleteProfileService';
import { DeleteProfileController } from '../controller/deleteProfileController';
@Module({
    imports: [
        TypeOrmModule.forFeature([ProfileSchema]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [
        CreateProfileController,
        GetAllProfileController,
        GetProfileByIdController,
        UpdateProfileController,
        DeleteProfileController
    ],
    providers: [
        AuthGuard,
        CreateProfileService,
        GetAllProfileService,
        GetProfileByIdService,
        UpdateProfileService,
        DeleteProfileService
    ]
})
export class ProfileModule { }
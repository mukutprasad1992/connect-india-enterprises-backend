import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CityService } from '../service/cityService';
import { CityController } from '../controller/cityController';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule,
    ],
    controllers: [CityController],
    providers: [CityService],
})
export class CityModule { }

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();
export const databaseConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV === 'development',
    migrations: [path.join(__dirname, '../migrations/**/*{.ts,.js}')],
    retryAttempts: 3,
    retryDelay: 3000,
};

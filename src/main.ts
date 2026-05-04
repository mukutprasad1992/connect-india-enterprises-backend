// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './appModule';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: [
//       'http://3.237.2.74:3001',
//       'http://localhost:3000',
//       'http://localhost:54099',
//     ],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   });

//   await app.listen(process.env.PORT || 5000);
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './appModule';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ THIS IS CRITICAL
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: [
      'http://3.237.2.74:3001',
      'http://localhost:3000',
      'http://localhost:54099',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 5000);
}
bootstrap();

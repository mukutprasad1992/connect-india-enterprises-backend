import { NestFactory } from '@nestjs/core';
import { AppModule } from './appModule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors : true});

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://3.237.2.74:3001',
        'http://localhost:3001',
        'http://localhost:54099'
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',X-Requested-With,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();

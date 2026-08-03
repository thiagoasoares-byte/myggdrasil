import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppDataSource } from './database/data-source';

export async function bootstrapNestApp() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await app.init();

  return app;
}
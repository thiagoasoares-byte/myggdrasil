require('dotenv').config(); 
import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'
const cookieParser = require('cookie-parser')
import { AppDataSource } from "./database/data-source";

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);

  // CORS: precisa liberar explicitamente o domínio do frontend (Vercel),
  // já que agora frontend e backend ficam em domínios diferentes.
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  // Kafka foi removido do fluxo de produção (ver docs/kafka-email-removal.md).
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3000);
  try {
    await AppDataSource.initialize()
  } catch (error){
    console.log(error)
  }
}

bootstrap();
 
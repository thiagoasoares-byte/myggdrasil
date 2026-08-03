require('dotenv').config(); 
import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'
const cookieParser = require('cookie-parser')
import { AppDataSource } from "./database/data-source";

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);

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
 
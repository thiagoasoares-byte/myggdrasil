require('dotenv').config(); 
import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'
import { AppDataSource } from "./database/data-source";

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT ?? 3000);
  try {
    await AppDataSource.initialize()
  } catch (error){
    console.log(error)
  }
}

bootstrap();
 
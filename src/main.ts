require('dotenv').config(); 
import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'
const cookieParser = require('cookie-parser')
import { AppDataSource } from "./database/data-source";
import { Transport } from "@nestjs/microservices";
import { Partitioners } from 'kafkajs';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER],
        createPartitioner: Partitioners.LegacyPartitioner,
      },
      consumer: {
        groupId: 'myggdrasil-consumer',
      },
    },
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(cookieParser())
  await app.startAllMicroservices()
  await app.listen(process.env.PORT ?? 3000);
  try {
    await AppDataSource.initialize()
  } catch (error){
    console.log(error)
  }
}

bootstrap();
 
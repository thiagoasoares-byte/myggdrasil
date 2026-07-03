import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaController } from '../kafka/kafka.controller';
import { Partitioners } from 'kafkajs';

const kafkaBroker: string[] = process.env.KAFKA_BROKER
  ? process.env.KAFKA_BROKER.split(',').map((broker) => broker.trim()).filter(Boolean)
  : [];

@Module({
  imports: [ClientsModule.register([
    {
      name: 'KAFKA_SERVICE',
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: kafkaBroker,
          createPartitioner: Partitioners.LegacyPartitioner,
        },
        consumer: {
          groupId: 'user-signup-group',
        },
      },
    },
  ])],
  controllers: [UsersController, KafkaController],
  providers: [UsersService],
})
export class UsersModule {}

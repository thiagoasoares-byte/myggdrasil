import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { EventModule } from './event/event.module';
import { KafkaController } from './kafka/kafka.controller';
import { UserEntity } from './database/entities/user.entity';
import { EventEntity } from './database/entities/event.entity';
import { EventType } from './database/entities/eventtype.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT ?? '3306', 10),
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.BDNAME,
      entities: [UserEntity, EventEntity, EventType],
      synchronize: false,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    EventModule,
  ],
  controllers: [AppController, KafkaController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthGuard
  }],
})
export class AppModule {}
 
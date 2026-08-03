import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { EventModule } from './event/event.module';
import { AnalysisModule } from './analysis/analysis.module';
import { UserEntity } from './database/entities/user.entity';
import { EventEntity } from './database/entities/event.entity';
import { EventType } from './database/entities/eventtype.entity';
import { EmailTokenEntity } from './database/entities/email_token.entity';
import { EventRelationshipEntity } from './database/entities/eventrelationship.entity';
import { AnalysisCacheEntity } from './database/entities/analysis_cache.entity';
import * as fs from 'fs';

const sslEnabled = process.env.MYSQL_SSL === 'true';
const sslCaPath = process.env.MYSQL_SSL_CA;
const ssl = sslEnabled
  ? {
      rejectUnauthorized: !!sslCaPath,
      ca: sslCaPath ? fs.readFileSync(sslCaPath).toString() : undefined,
    }
  : undefined;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT ?? '3306', 10),
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.BDNAME,
      entities: [UserEntity, EventEntity, EventType, EmailTokenEntity, EventRelationshipEntity, AnalysisCacheEntity],
      synchronize: false,
      autoLoadEntities: true,
      ssl,
    }),
    UsersModule,
    AuthModule,
    EventModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthGuard
  }],
})
export class AppModule {}
 
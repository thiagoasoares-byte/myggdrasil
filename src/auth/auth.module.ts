import { Module } from '@nestjs/common';
import * as fs from 'fs'
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [JwtModule.register({
    privateKey: fs.readFileSync(`${process.env.JWT_PRIVATE_KEY}`,'utf8'),
    publicKey: fs.readFileSync(`${process.env.JWT_PUBLIC_KEY}`,'utf8'),
    signOptions: {
      algorithm: 'RS256',
      expiresIn: '1d'
    }
  })],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [JwtModule, AuthGuard]
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { requireSecretValue } from '../utils/secret';

@Module({
  imports: [
    JwtModule.register({
      privateKey: requireSecretValue('JWT_PRIVATE_KEY', process.env.JWT_PRIVATE_KEY),
      publicKey: requireSecretValue('JWT_PUBLIC_KEY', process.env.JWT_PUBLIC_KEY),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [JwtModule, AuthGuard]
})
export class AuthModule {}

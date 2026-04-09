import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

/** Seconds; override with JWT_EXPIRES_SEC (e.g. 604800 = 7d). */
const expiresSec = Number(process.env.JWT_EXPIRES_SEC || 7 * 24 * 60 * 60);

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-only-min-16-chars!!',
      signOptions: { expiresIn: expiresSec },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

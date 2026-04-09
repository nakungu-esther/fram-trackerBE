import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from './auth-user.interface';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
      // eslint-disable-next-line no-console
      console.warn(
        '[auth] JWT_SECRET is missing or shorter than 16 characters. Set a strong secret in production.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'dev-only-min-16-chars!!',
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name || '',
    };
  }
}

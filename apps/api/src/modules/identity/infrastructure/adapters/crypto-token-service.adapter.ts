import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  TokenServicePort,
  TokenPayload,
} from '../../application/ports/token-service.port.js';

interface RawJwtPayload extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Adaptateur d'Infrastructure : Émission et Vérification de Jetons JWT (HMAC-SHA256)
 * Implémente le port TokenServicePort sans dépendance externe fragile.
 * Vérifie l'expiration et compare les signatures en temps constant.
 */
@Injectable()
export class CryptoTokenServiceAdapter implements TokenServicePort {
  private readonly secret: string;
  private readonly expiresInSeconds: number;

  constructor(configService: ConfigService) {
    this.secret =
      configService.get<string>('JWT_SECRET') ??
      'my-community-development-secret-key-must-be-changed-in-production-32chars!';
    this.expiresInSeconds = 7 * 24 * 60 * 60; // 7 jours
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const rawPayload: RawJwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.expiresInSeconds,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(rawPayload)).toString('base64url');

    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', this.secret)
      .update(dataToSign)
      .digest('base64url');

    return `${dataToSign}.${signature}`;
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = createHmac('sha256', this.secret)
      .update(dataToSign)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedSigBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedSigBuffer)
    ) {
      return null;
    }

    try {
      const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload: RawJwtPayload = JSON.parse(payloadJson);

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null;
      }

      return {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
      };
    } catch {
      return null;
    }
  }
}

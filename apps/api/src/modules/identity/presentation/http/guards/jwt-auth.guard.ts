import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ValidateSessionQuery } from '../../../application/queries/validate-session.query.js';
import { UserAccountEntity } from '../../../domain/entities/user-account.entity.js';
import { TokenPayload } from '../../../application/ports/token-service.port.js';

export interface AuthenticatedRequest extends Request {
  user?: UserAccountEntity;
  tokenPayload?: TokenPayload;
}

/**
 * Guard NestJS : Authentification par Jeton Porteur (Bearer Token)
 * Vérifie la présence et la validité cryptographique du jeton,
 * puis attache l'entité UserAccount active à l'objet Request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly validateSession: ValidateSessionQuery) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException("Jeton d'authentification manquant ou invalide.");
    }

    const token = authHeader.slice(7).trim();
    const session = await this.validateSession.execute(token);

    if (!session) {
      throw new UnauthorizedException("Session expirée ou jeton d'authentification invalide.");
    }

    request.user = session.account;
    request.tokenPayload = session.payload;

    return true;
  }
}

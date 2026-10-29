import { Injectable, Inject } from '@nestjs/common';
import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import {
  TokenServicePort,
  TOKEN_SERVICE_PORT,
  TokenPayload,
} from '../ports/token-service.port.js';
import {
  IdentityReaderPort,
  IDENTITY_READER_PORT,
} from '../ports/identity-reader.port.js';

export interface ValidatedSession {
  account: UserAccountEntity;
  payload: TokenPayload;
}

/**
 * Cas d'Usage de Consultation : Validation d'un Jeton de Session (ValidateSessionQuery)
 * Utilisé par les Guards d'authentification pour vérifier la validité de la session en cours.
 */
@Injectable()
export class ValidateSessionQuery {
  constructor(
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: TokenServicePort,
    @Inject(IDENTITY_READER_PORT)
    private readonly identityReader: IdentityReaderPort,
  ) {}

  async execute(token: string): Promise<ValidatedSession | null> {
    if (!token || token.trim().length === 0) {
      return null;
    }

    const payload = await this.tokenService.verifyToken(token);
    if (!payload) {
      return null;
    }

    const account = await this.identityReader.findById(payload.userId);
    if (!account || !account.isActive()) {
      return null;
    }

    return { account, payload };
  }
}

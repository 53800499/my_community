import {
  Injectable,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import {
  IdentityReaderPort,
  IDENTITY_READER_PORT,
} from '../ports/identity-reader.port.js';
import {
  PasswordHasherPort,
  PASSWORD_HASHER_PORT,
} from '../ports/password-hasher.port.js';
import {
  TokenServicePort,
  TOKEN_SERVICE_PORT,
} from '../ports/token-service.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { LoginCommand } from './login.command.js';

export interface LoginResult {
  account: UserAccountEntity;
  token: string;
}

/**
 * Cas d'Usage Applicatif : Connexion d'un Citoyen (LoginUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'authentification et à la vérification des accréditations.
 * - DIP : Dépend uniquement des ports abstraits.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IDENTITY_READER_PORT)
    private readonly reader: IdentityReaderPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: TokenServicePort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const rawIdentifier = command.identifier.trim();
    let account: UserAccountEntity | null = null;

    if (rawIdentifier.includes('@')) {
      try {
        const emailVo = new Email(rawIdentifier);
        account = await this.reader.findByEmail(emailVo);
      } catch {
        throw new UnauthorizedException('Identifiants incorrects.');
      }
    } else {
      try {
        const phoneVo = new PhoneNumber(rawIdentifier);
        account = await this.reader.findByPhoneNumber(phoneVo);
      } catch {
        throw new UnauthorizedException('Identifiants incorrects.');
      }
    }

    if (!account) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    if (account.isLocked()) {
      throw new ForbiddenException('Ce compte est verrouillé pour des raisons de sécurité.');
    }

    if (account.isSuspended()) {
      throw new ForbiddenException('Ce compte a été suspendu.');
    }

    if (!account.isActive()) {
      throw new ForbiddenException("Ce compte n'est pas actif.");
    }

    const isPasswordValid = await this.passwordHasher.verify(
      command.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      if (this.auditLogger) {
        const failedAudit = AuditLogEntity.create({
          id: randomUUID(),
          actorId: account.id,
          action: 'LOGIN_FAILED',
          resourceType: 'USER_ACCOUNT',
          resourceId: account.id,
          payload: { reason: 'INVALID_CREDENTIALS' },
          ipAddress: command.ipAddress ?? null,
          userAgent: command.userAgent ?? null,
          createdAt: new Date(),
        });
        await this.auditLogger.log(failedAudit);
      }
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    if (this.auditLogger) {
      const successAudit = AuditLogEntity.create({
        id: randomUUID(),
        actorId: account.id,
        action: 'USER_LOGGED_IN',
        resourceType: 'USER_ACCOUNT',
        resourceId: account.id,
        payload: {
          phoneNumber: account.phoneNumber.getValue(),
        },
        ipAddress: command.ipAddress ?? null,
        userAgent: command.userAgent ?? null,
        createdAt: new Date(),
      });
      await this.auditLogger.log(successAudit);
    }

    const token = await this.tokenService.generateToken({
      userId: account.id,
      phoneNumber: account.phoneNumber.getValue(),
      email: account.email?.getValue() ?? null,
    });

    return { account, token };
  }
}

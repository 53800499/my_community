import { Injectable, Inject, ConflictException, BadRequestException, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import {
  IdentityReaderPort,
  IDENTITY_READER_PORT,
} from '../ports/identity-reader.port.js';
import {
  IdentityWriterPort,
  IDENTITY_WRITER_PORT,
} from '../ports/identity-writer.port.js';
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
import { RegisterCommand } from './register.command.js';

export interface RegisterResult {
  account: UserAccountEntity;
  token: string;
}

/**
 * Cas d'Usage Applicatif : Inscription d'un Citoyen (RegisterUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'enregistrement et à la validation des credentials initiaux.
 * - DIP : Dépend uniquement des ports abstraits injectés par tokens.
 */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IDENTITY_READER_PORT)
    private readonly reader: IdentityReaderPort,
    @Inject(IDENTITY_WRITER_PORT)
    private readonly writer: IdentityWriterPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: TokenServicePort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    if (!command.password || command.password.length < 8) {
      throw new BadRequestException('Le mot de passe doit comporter au moins 8 caractères.');
    }

    const phoneNumberVo = new PhoneNumber(command.phoneNumber);
    const existingByPhone = await this.reader.findByPhoneNumber(phoneNumberVo);
    if (existingByPhone) {
      throw new ConflictException('Un compte existe déjà avec ce numéro de téléphone.');
    }

    let emailVo: Email | null = null;
    if (command.email && command.email.trim().length > 0) {
      emailVo = new Email(command.email);
      const existingByEmail = await this.reader.findByEmail(emailVo);
      if (existingByEmail) {
        throw new ConflictException('Un compte existe déjà avec cette adresse email.');
      }
    }

    const passwordHashVo = await this.passwordHasher.hash(command.password);
    const accountId = command.id ?? randomUUID();

    const account = UserAccountEntity.create({
      id: accountId,
      email: emailVo,
      phoneNumber: phoneNumberVo,
      passwordHash: passwordHashVo,
    });

    await this.writer.save(account);

    if (this.auditLogger) {
      const auditEntry = AuditLogEntity.create({
        id: randomUUID(),
        actorId: account.id,
        action: 'USER_REGISTERED',
        resourceType: 'USER_ACCOUNT',
        resourceId: account.id,
        payload: {
          phoneNumber: account.phoneNumber.getValue(),
          email: account.email?.getValue() ?? null,
        },
        ipAddress: command.ipAddress ?? null,
        userAgent: command.userAgent ?? null,
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditEntry);
    }

    const token = await this.tokenService.generateToken({
      userId: account.id,
      phoneNumber: account.phoneNumber.getValue(),
      email: account.email?.getValue() ?? null,
    });

    return { account, token };
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import {
  Email,
  PhoneNumber,
  PasswordHash,
  UserAccountEntity,
} from '../../src/modules/identity/domain/index.js';
import { IdentityReaderPort } from '../../src/modules/identity/application/ports/identity-reader.port.js';
import { IdentityWriterPort } from '../../src/modules/identity/application/ports/identity-writer.port.js';
import { RegisterUseCase } from '../../src/modules/identity/application/commands/register.use-case.js';
import { LoginUseCase } from '../../src/modules/identity/application/commands/login.use-case.js';
import { ValidateSessionQuery } from '../../src/modules/identity/application/queries/validate-session.query.js';
import { CryptoPasswordHasherAdapter } from '../../src/modules/identity/infrastructure/adapters/crypto-password-hasher.adapter.js';
import { CryptoTokenServiceAdapter } from '../../src/modules/identity/infrastructure/adapters/crypto-token-service.adapter.js';
import { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../src/modules/audit/domain/entities/audit-log.entity.js';

/**
 * InMemory Repository d'Identity pour les tests unitaires.
 * Conforme LSP (Liskov Substitution Principle).
 */
class InMemoryIdentityRepository implements IdentityReaderPort, IdentityWriterPort {
  public accounts: Map<string, UserAccountEntity> = new Map();

  async findById(id: string): Promise<UserAccountEntity | null> {
    return this.accounts.get(id) ?? null;
  }

  async findByEmail(email: Email): Promise<UserAccountEntity | null> {
    for (const acc of this.accounts.values()) {
      if (acc.email && acc.email.equals(email)) {
        return acc;
      }
    }
    return null;
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserAccountEntity | null> {
    for (const acc of this.accounts.values()) {
      if (acc.phoneNumber.equals(phoneNumber)) {
        return acc;
      }
    }
    return null;
  }

  async save(account: UserAccountEntity): Promise<void> {
    this.accounts.set(account.id, account);
  }

  async update(account: UserAccountEntity): Promise<void> {
    this.accounts.set(account.id, account);
  }
}

class InMemoryAuditLogger implements AuditLoggerPort {
  public logs: AuditLogEntity[] = [];

  async log(entry: AuditLogEntity): Promise<void> {
    this.logs.push(entry);
  }
}

describe('Module Identity — Conformité SOLID & Hexagonale', () => {
  let repository: InMemoryIdentityRepository;
  let auditLogger: InMemoryAuditLogger;
  let passwordHasher: CryptoPasswordHasherAdapter;
  let tokenService: CryptoTokenServiceAdapter;
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;
  let validateSessionQuery: ValidateSessionQuery;

  beforeEach(() => {
    repository = new InMemoryIdentityRepository();
    auditLogger = new InMemoryAuditLogger();
    passwordHasher = new CryptoPasswordHasherAdapter();

    const mockConfigService = {
      get: (key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key-32-chars-long-for-testing!!';
        return undefined;
      },
    } as unknown as ConfigService;

    tokenService = new CryptoTokenServiceAdapter(mockConfigService);

    registerUseCase = new RegisterUseCase(
      repository,
      repository,
      passwordHasher,
      tokenService,
      auditLogger,
    );

    loginUseCase = new LoginUseCase(
      repository,
      passwordHasher,
      tokenService,
      auditLogger,
    );

    validateSessionQuery = new ValidateSessionQuery(tokenService, repository);
  });

  describe('1. Domaine Pur & Value Objects (Invariants)', () => {
    it('devrait valider et normaliser une adresse email en minuscules', () => {
      const email = new Email('  Citizen.BENIN@Example.COM ');
      expect(email.getValue()).toBe('citizen.benin@example.com');
      expect(() => new Email('invalid-email-format')).toThrow();
    });

    it('devrait assainir et valider un numéro de téléphone béninois / international', () => {
      const phone = new PhoneNumber('+229 97-00-11-22');
      expect(phone.getValue()).toBe('+22997001122');
      expect(() => new PhoneNumber('123')).toThrow();
    });

    it("devrait gérer les transitions d'état du compte utilisateur", () => {
      const account = UserAccountEntity.create({
        id: 'acc-1',
        email: new Email('user@test.bj'),
        phoneNumber: new PhoneNumber('+22997000001'),
        passwordHash: new PasswordHash('scrypt$fake$hash'),
      });

      expect(account.isActive()).toBe(true);
      account.suspend();
      expect(account.isSuspended()).toBe(true);
      expect(account.isActive()).toBe(false);

      account.activate();
      expect(account.isActive()).toBe(true);

      account.lock();
      expect(account.isLocked()).toBe(true);
      expect(account.isActive()).toBe(false);
    });
  });

  describe('2. Adaptateurs Cryptographiques (OWASP Scrypt & Token JWT)', () => {
    it('devrait hacher et vérifier un mot de passe avec Scrypt', async () => {
      const plainPassword = 'Secr3tPassword!2026';
      const hash = await passwordHasher.hash(plainPassword);

      expect(hash.getValue()).toContain('scrypt$');
      const isValid = await passwordHasher.verify(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await passwordHasher.verify('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('devrait émettre un jeton JWT valide et détecter toute altération', async () => {
      const payload = {
        userId: 'user-uuid-1',
        phoneNumber: '+22997000001',
        email: 'user@test.bj',
      };

      const token = await tokenService.generateToken(payload);
      expect(token.split('.')).toHaveLength(3);

      const verified = await tokenService.verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);

      // Altération de la signature
      const tamperedToken = `${token.slice(0, -5)}abcde`;
      const tamperedResult = await tokenService.verifyToken(tamperedToken);
      expect(tamperedResult).toBeNull();
    });
  });

  describe("3. Cas d'Usage Applicatifs (Register, Login, Session)", () => {
    it('devrait inscrire un utilisateur avec succès, hacher le mot de passe et émettre un audit', async () => {
      const result = await registerUseCase.execute({
        phoneNumber: '+229 97 12 34 56',
        password: 'PasswordSuperSecure123',
        email: 'alice@communaute.bj',
      });

      expect(result.account.id).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.account.phoneNumber.getValue()).toBe('+22997123456');
      expect(result.account.email?.getValue()).toBe('alice@communaute.bj');

      // Vérification audit
      expect(auditLogger.logs).toHaveLength(1);
      expect(auditLogger.logs[0].action).toBe('USER_REGISTERED');
      expect(auditLogger.logs[0].actorId).toBe(result.account.id);
    });

    it("devrait refuser l'inscription si le numéro de téléphone est déjà utilisé", async () => {
      await registerUseCase.execute({
        phoneNumber: '+22997123456',
        password: 'PasswordSuperSecure123',
      });

      await expect(
        registerUseCase.execute({
          phoneNumber: '+229 97 12 34 56', // Même numéro avec espaces
          password: 'AnotherPassword123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait refuser un mot de passe de moins de 8 caractères', async () => {
      await expect(
        registerUseCase.execute({
          phoneNumber: '+22997123456',
          password: 'short',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait connecter un utilisateur par son numéro de téléphone ou son email', async () => {
      await registerUseCase.execute({
        phoneNumber: '+22997001122',
        email: 'citoyen@cotonou.bj',
        password: 'CorrectPassword123',
      });

      // Connexion par téléphone
      const loginByPhone = await loginUseCase.execute({
        identifier: '+22997001122',
        password: 'CorrectPassword123',
      });
      expect(loginByPhone.token).toBeDefined();

      // Connexion par email
      const loginByEmail = await loginUseCase.execute({
        identifier: 'CITOYEN@COTONOU.BJ',
        password: 'CorrectPassword123',
      });
      expect(loginByEmail.token).toBeDefined();
    });

    it('devrait rejeter la connexion en cas de mauvais mot de passe et journaliser un échec', async () => {
      await registerUseCase.execute({
        phoneNumber: '+22997001122',
        password: 'CorrectPassword123',
      });

      await expect(
        loginUseCase.execute({
          identifier: '+22997001122',
          password: 'WrongPassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      const failedLog = auditLogger.logs.find((l) => l.action === 'LOGIN_FAILED');
      expect(failedLog).toBeDefined();
    });

    it('devrait refuser la connexion si le compte est suspendu ou verrouillé', async () => {
      const reg = await registerUseCase.execute({
        phoneNumber: '+22997001122',
        password: 'CorrectPassword123',
      });

      reg.account.suspend();
      await repository.update(reg.account);

      await expect(
        loginUseCase.execute({
          identifier: '+22997001122',
          password: 'CorrectPassword123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait valider une session active et rejeter un compte suspendu', async () => {
      const reg = await registerUseCase.execute({
        phoneNumber: '+22997001122',
        password: 'CorrectPassword123',
      });

      const session = await validateSessionQuery.execute(reg.token);
      expect(session).not.toBeNull();
      expect(session?.account.id).toBe(reg.account.id);

      // Suspension
      reg.account.suspend();
      await repository.update(reg.account);

      const sessionAfterSuspension = await validateSessionQuery.execute(reg.token);
      expect(sessionAfterSuspension).toBeNull();
    });
  });
});

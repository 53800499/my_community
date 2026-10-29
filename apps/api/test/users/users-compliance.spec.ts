import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserProfileEntity } from '../../src/modules/users/domain/index.js';
import { UserReaderPort } from '../../src/modules/users/application/ports/user-reader.port.js';
import { UserWriterPort } from '../../src/modules/users/application/ports/user-writer.port.js';
import { UpdateProfileUseCase } from '../../src/modules/users/application/commands/update-profile.use-case.js';
import { GetUserProfileQuery } from '../../src/modules/users/application/queries/get-user-profile.query.js';
import { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../src/modules/audit/domain/entities/audit-log.entity.js';

/**
 * InMemory Repository pour les tests du module Users.
 * Conforme LSP (Liskov Substitution Principle).
 */
class InMemoryUserRepository implements UserReaderPort, UserWriterPort {
  public profilesByUserId: Map<string, UserProfileEntity> = new Map();
  public profilesById: Map<string, UserProfileEntity> = new Map();

  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.profilesByUserId.get(userId) ?? null;
  }

  async findById(id: string): Promise<UserProfileEntity | null> {
    return this.profilesById.get(id) ?? null;
  }

  async save(profile: UserProfileEntity): Promise<void> {
    this.profilesByUserId.set(profile.userId, profile);
    this.profilesById.set(profile.id, profile);
  }

  async update(profile: UserProfileEntity): Promise<void> {
    this.profilesByUserId.set(profile.userId, profile);
    this.profilesById.set(profile.id, profile);
  }
}

class InMemoryAuditLogger implements AuditLoggerPort {
  public logs: AuditLogEntity[] = [];

  async log(entry: AuditLogEntity): Promise<void> {
    this.logs.push(entry);
  }
}

describe('Module Users — Conformité SOLID & Hexagonale', () => {
  let repository: InMemoryUserRepository;
  let auditLogger: InMemoryAuditLogger;
  let updateProfileUseCase: UpdateProfileUseCase;
  let getUserProfileQuery: GetUserProfileQuery;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    auditLogger = new InMemoryAuditLogger();
    updateProfileUseCase = new UpdateProfileUseCase(repository, repository, auditLogger);
    getUserProfileQuery = new GetUserProfileQuery(repository);
  });

  describe('1. Domaine Pur (UserProfileEntity & Invariants)', () => {
    it('devrait créer une entité de profil valide et calculer le nom complet', () => {
      const profile = UserProfileEntity.create({
        id: 'prof-1',
        userId: 'user-1',
        firstName: 'Alice',
        lastName: 'Bio',
        city: 'Cotonou',
      });

      expect(profile.id).toBe('prof-1');
      expect(profile.userId).toBe('user-1');
      expect(profile.firstName).toBe('Alice');
      expect(profile.lastName).toBe('Bio');
      expect(profile.fullName).toBe('Alice Bio');
      expect(profile.city).toBe('Cotonou');
      expect(profile.avatarKey).toBeNull();
    });

    it('devrait rejeter un profil avec un prénom ou un nom vide', () => {
      expect(() =>
        UserProfileEntity.create({
          id: 'prof-1',
          userId: 'user-1',
          firstName: '  ',
          lastName: 'Bio',
        }),
      ).toThrow();

      expect(() =>
        UserProfileEntity.create({
          id: 'prof-1',
          userId: 'user-1',
          firstName: 'Alice',
          lastName: '',
        }),
      ).toThrow();
    });

    it('devrait mettre à jour les informations du profil et l’avatar', () => {
      const profile = UserProfileEntity.create({
        id: 'prof-1',
        userId: 'user-1',
        firstName: 'Alice',
        lastName: 'Bio',
      });

      profile.updateInfo({
        bio: 'Nouvelle biographie citoyenne',
        city: 'Porto-Novo',
      });

      expect(profile.bio).toBe('Nouvelle biographie citoyenne');
      expect(profile.city).toBe('Porto-Novo');
      expect(profile.firstName).toBe('Alice'); // Inchangé

      profile.updateAvatar('avatars/alice.webp');
      expect(profile.avatarKey).toBe('avatars/alice.webp');
    });
  });

  describe("2. Cas d'Usage Applicatifs (UpdateProfile, GetProfile, Audit)", () => {
    it('devrait initialiser un nouveau profil utilisateur et consigner une trace d’audit', async () => {
      const profile = await updateProfileUseCase.execute({
        userId: 'user-100',
        firstName: 'Koffi',
        lastName: 'Mensah',
        city: 'Parakou',
      });

      expect(profile.userId).toBe('user-100');
      expect(profile.fullName).toBe('Koffi Mensah');
      expect(profile.city).toBe('Parakou');

      // Vérification audit
      expect(auditLogger.logs).toHaveLength(1);
      expect(auditLogger.logs[0].action).toBe('USER_PROFILE_CREATED');
      expect(auditLogger.logs[0].actorId).toBe('user-100');
    });

    it('devrait refuser d’initialiser un profil sans prénom ou sans nom', async () => {
      await expect(
        updateProfileUseCase.execute({
          userId: 'user-101',
          city: 'Abomey-Calavi',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait mettre à jour un profil existant sans écraser les autres données', async () => {
      // 1. Création
      await updateProfileUseCase.execute({
        userId: 'user-102',
        firstName: 'Chantal',
        lastName: 'Agossou',
        city: 'Ouidah',
      });

      // 2. Mise à jour de la bio uniquement
      const updated = await updateProfileUseCase.execute({
        userId: 'user-102',
        bio: 'Responsable associative',
      });

      expect(updated.firstName).toBe('Chantal');
      expect(updated.lastName).toBe('Agossou');
      expect(updated.city).toBe('Ouidah');
      expect(updated.bio).toBe('Responsable associative');

      const updateLog = auditLogger.logs.find((l) => l.action === 'USER_PROFILE_UPDATED');
      expect(updateLog).toBeDefined();
    });

    it('devrait consulter un profil existant par son identifiant utilisateur', async () => {
      await updateProfileUseCase.execute({
        userId: 'user-103',
        firstName: 'Didier',
        lastName: 'Zinsou',
      });

      const profile = await getUserProfileQuery.execute('user-103');
      expect(profile).toBeDefined();
      expect(profile.fullName).toBe('Didier Zinsou');
    });

    it('devrait lever NotFoundException pour un profil inexistant', async () => {
      await expect(getUserProfileQuery.execute('user-non-existant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

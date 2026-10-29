import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  CommunityMembershipEntity,
  MembershipStatus,
} from '../../src/modules/memberships/domain/entities/community-membership.entity.js';
import { RequestMembershipUseCase } from '../../src/modules/memberships/application/commands/request-membership.use-case.js';
import { DecideMembershipUseCase } from '../../src/modules/memberships/application/commands/decide-membership.use-case.js';
import { AssignRoleUseCase } from '../../src/modules/memberships/application/commands/assign-role.use-case.js';
import { ListCommunityMembersQuery } from '../../src/modules/memberships/application/queries/list-community-members.query.js';
import { GetUserMembershipQuery } from '../../src/modules/memberships/application/queries/get-user-membership.query.js';
import { MembershipReaderPort } from '../../src/modules/memberships/application/ports/membership-reader.port.js';
import { MembershipWriterPort } from '../../src/modules/memberships/application/ports/membership-writer.port.js';
import { MembershipMapper } from '../../src/modules/memberships/infrastructure/mappers/membership.mapper.js';
import { ConflictException, ForbiddenException } from '@nestjs/common';

class InMemoryMembershipRepository
  implements MembershipReaderPort, MembershipWriterPort
{
  public memberships = new Map<string, CommunityMembershipEntity>();

  async findById(id: string): Promise<CommunityMembershipEntity | null> {
    return this.memberships.get(id) ?? null;
  }

  async findByCommunityAndUser(
    communityId: string,
    userId: string,
  ): Promise<CommunityMembershipEntity | null> {
    for (const m of this.memberships.values()) {
      if (m.communityId === communityId && m.userId === userId) {
        return m;
      }
    }
    return null;
  }

  async listByCommunity(
    communityId: string,
    status?: MembershipStatus,
  ): Promise<CommunityMembershipEntity[]> {
    const list = Array.from(this.memberships.values()).filter(
      (m) => m.communityId === communityId,
    );
    if (status) {
      return list.filter((m) => m.status === status);
    }
    return list;
  }

  async listByUser(userId: string): Promise<CommunityMembershipEntity[]> {
    return Array.from(this.memberships.values()).filter(
      (m) => m.userId === userId,
    );
  }

  async save(membership: CommunityMembershipEntity): Promise<void> {
    this.memberships.set(membership.id, membership);
  }

  async updateStatus(membership: CommunityMembershipEntity): Promise<void> {
    this.memberships.set(membership.id, membership);
  }

  async updateRoles(membership: CommunityMembershipEntity): Promise<void> {
    this.memberships.set(membership.id, membership);
  }
}

describe('Module Memberships — Tests de Conformité SOLID & Contextual RBAC (Niveau 2)', () => {
  let repository: InMemoryMembershipRepository;
  let mockNotifier: any;
  let mockAuditLogger: any;

  beforeEach(() => {
    repository = new InMemoryMembershipRepository();
    mockNotifier = {
      execute: vi.fn().mockResolvedValue({} as any),
    };
    mockAuditLogger = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('1. Domaine Pur : CommunityMembershipEntity', () => {
    it('devrait instancier une adhésion avec les valeurs par défaut (PENDING, rôle MEMBER)', () => {
      const id = randomUUID();
      const communityId = randomUUID();
      const userId = randomUUID();

      const membership = CommunityMembershipEntity.create({
        id,
        communityId,
        userId,
      });

      expect(membership.id).toBe(id);
      expect(membership.communityId).toBe(communityId);
      expect(membership.userId).toBe(userId);
      expect(membership.status).toBe('PENDING');
      expect(membership.roles).toEqual(['MEMBER']);
      expect(membership.isManagerOrAdmin()).toBe(false);
    });

    it('devrait gérer les transitions d’état et interdire les transitions invalides', () => {
      const membership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId: randomUUID(),
        userId: randomUUID(),
      });

      membership.approve();
      expect(membership.status).toBe('ACTIVE');

      expect(() => membership.approve()).toThrow('déjà active');

      membership.suspend();
      expect(membership.status).toBe('SUSPENDED');

      membership.revoke();
      expect(membership.status).toBe('REVOKED');
    });

    it('devrait gérer l’attribution et le retrait des rôles locaux', () => {
      const membership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId: randomUUID(),
        userId: randomUUID(),
        status: 'ACTIVE',
      });

      membership.assignRole('MANAGER');
      expect(membership.hasRole('MANAGER')).toBe(true);
      expect(membership.isManagerOrAdmin()).toBe(true);

      membership.removeRole('MANAGER');
      expect(membership.hasRole('MANAGER')).toBe(false);
      expect(membership.isManagerOrAdmin()).toBe(false);

      expect(() => membership.removeRole('MEMBER')).toThrow(
        'Le rôle MEMBER ne peut pas être retiré',
      );
    });
  });

  describe('2. Cas d’Usage : RequestMembershipUseCase', () => {
    it('devrait enregistrer une demande d’adhésion PENDING et journaliser l’audit', async () => {
      const useCase = new RequestMembershipUseCase(
        repository,
        repository,
        undefined,
        mockAuditLogger,
      );
      const communityId = randomUUID();
      const userId = randomUUID();

      const membership = await useCase.execute({
        communityId,
        userId,
      });

      expect(membership.status).toBe('PENDING');
      expect(membership.userId).toBe(userId);

      const inRepo = await repository.findByCommunityAndUser(communityId, userId);
      expect(inRepo).toBeDefined();
      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });

    it('devrait rejeter un doublon de demande ou une adhésion déjà active', async () => {
      const useCase = new RequestMembershipUseCase(repository, repository);
      const communityId = randomUUID();
      const userId = randomUUID();

      await useCase.execute({ communityId, userId });

      await expect(
        useCase.execute({ communityId, userId }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('3. Cas d’Usage : DecideMembershipUseCase (Contextual RBAC)', () => {
    it('devrait permettre à un MANAGER local d’approuver l’adhésion et notifier le citoyen', async () => {
      const communityId = randomUUID();
      const managerId = randomUUID();
      const citizenId = randomUUID();

      // Manager local
      const managerMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: managerId,
        status: 'ACTIVE',
        roles: ['MEMBER', 'MANAGER'],
      });
      await repository.save(managerMembership);

      // Demande citoyenne
      const pendingMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: citizenId,
        status: 'PENDING',
      });
      await repository.save(pendingMembership);

      const useCase = new DecideMembershipUseCase(
        repository,
        repository,
        mockNotifier,
        mockAuditLogger,
      );

      const updated = await useCase.execute({
        communityId,
        targetUserId: citizenId,
        deciderUserId: managerId,
        decision: 'ACTIVE',
      });

      expect(updated.status).toBe('ACTIVE');
      expect(mockNotifier.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: citizenId,
          type: 'MEMBERSHIP_REQUEST',
        }),
      );
      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });

    it('devrait refuser l’instruction si l’opérateur est un simple MEMBER de la communauté (RBAC violation)', async () => {
      const communityId = randomUUID();
      const regularMemberId = randomUUID();
      const citizenId = randomUUID();

      // Membre sans privilèges
      const regularMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: regularMemberId,
        status: 'ACTIVE',
        roles: ['MEMBER'],
      });
      await repository.save(regularMembership);

      const pending = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: citizenId,
        status: 'PENDING',
      });
      await repository.save(pending);

      const useCase = new DecideMembershipUseCase(repository, repository);

      await expect(
        useCase.execute({
          communityId,
          targetUserId: citizenId,
          deciderUserId: regularMemberId,
          decision: 'ACTIVE',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Cas d’Usage : AssignRoleUseCase (Contextual RBAC)', () => {
    it('devrait permettre à un ADMIN local de promouvoir un membre au rôle MODERATOR', async () => {
      const communityId = randomUUID();
      const adminId = randomUUID();
      const targetUserId = randomUUID();

      // Admin local
      const adminMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: adminId,
        status: 'ACTIVE',
        roles: ['MEMBER', 'ADMIN'],
      });
      await repository.save(adminMembership);

      // Membre cible
      const targetMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: targetUserId,
        status: 'ACTIVE',
        roles: ['MEMBER'],
      });
      await repository.save(targetMembership);

      const useCase = new AssignRoleUseCase(
        repository,
        repository,
        mockNotifier,
        mockAuditLogger,
      );

      const updated = await useCase.execute({
        communityId,
        targetUserId,
        adminUserId: adminId,
        role: 'MODERATOR',
        action: 'ADD',
      });

      expect(updated.hasRole('MODERATOR')).toBe(true);
      expect(mockNotifier.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: targetUserId,
          type: 'SYSTEM',
        }),
      );
    });

    it('devrait interdire à un MANAGER d’attribuer des rôles (seul ADMIN autorisé)', async () => {
      const communityId = randomUUID();
      const managerId = randomUUID();
      const targetUserId = randomUUID();

      const managerMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: managerId,
        status: 'ACTIVE',
        roles: ['MEMBER', 'MANAGER'],
      });
      await repository.save(managerMembership);

      const targetMembership = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: targetUserId,
        status: 'ACTIVE',
      });
      await repository.save(targetMembership);

      const useCase = new AssignRoleUseCase(repository, repository);

      await expect(
        useCase.execute({
          communityId,
          targetUserId,
          adminUserId: managerId,
          role: 'MODERATOR',
          action: 'ADD',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('5. Requêtes et Data Mapper', () => {
    it('ListCommunityMembersQuery & GetUserMembershipQuery devraient fonctionner correctement', async () => {
      const communityId = randomUUID();
      const u1 = randomUUID();
      const m1 = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId,
        userId: u1,
        status: 'ACTIVE',
      });
      await repository.save(m1);

      const listQuery = new ListCommunityMembersQuery(repository);
      const members = await listQuery.execute({ communityId });
      expect(members).toHaveLength(1);

      const singleQuery = new GetUserMembershipQuery(repository);
      const found = await singleQuery.execute({ communityId, userId: u1 });
      expect(found).toBeDefined();
      expect(found?.userId).toBe(u1);
    });

    it('MembershipMapper devrait convertir fidèlement les entités en DTO', () => {
      const entity = CommunityMembershipEntity.create({
        id: randomUUID(),
        communityId: randomUUID(),
        userId: randomUUID(),
        status: 'ACTIVE',
        roles: ['MEMBER', 'MODERATOR'],
      });

      const dto = MembershipMapper.toResponseDto(entity);
      expect(dto.id).toBe(entity.id);
      expect(dto.roles).toContain('MODERATOR');
      expect(dto.status).toBe('ACTIVE');
    });
  });
});

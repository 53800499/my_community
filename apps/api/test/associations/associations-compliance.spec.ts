import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AssociationEntity } from '../../src/modules/associations/domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../src/modules/associations/domain/entities/association-member.entity.js';
import { AssociationCommunityLinkEntity } from '../../src/modules/associations/domain/entities/association-community-link.entity.js';
import { RegisterAssociationUseCase } from '../../src/modules/associations/application/commands/register-association.use-case.js';
import { LinkCommunityUseCase } from '../../src/modules/associations/application/commands/link-community.use-case.js';
import { ManageAssociationMemberUseCase } from '../../src/modules/associations/application/commands/manage-association-member.use-case.js';
import { ListAssociationsQuery } from '../../src/modules/associations/application/queries/list-associations.query.js';
import { GetAssociationQuery } from '../../src/modules/associations/application/queries/get-association.query.js';
import { AssociationReaderPort } from '../../src/modules/associations/application/ports/association-reader.port.js';
import { AssociationWriterPort } from '../../src/modules/associations/application/ports/association-writer.port.js';
import { AssociationMapper } from '../../src/modules/associations/infrastructure/mappers/association.mapper.js';
import { ConflictException, ForbiddenException } from '@nestjs/common';

class InMemoryAssociationRepository
  implements AssociationReaderPort, AssociationWriterPort
{
  public associations = new Map<string, AssociationEntity>();
  public members = new Map<string, AssociationMemberEntity>();
  public links: AssociationCommunityLinkEntity[] = [];

  async findById(id: string): Promise<AssociationEntity | null> {
    return this.associations.get(id) ?? null;
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<AssociationEntity | null> {
    for (const a of this.associations.values()) {
      if (a.registrationNumber === registrationNumber) {
        return a;
      }
    }
    return null;
  }

  async listAll(): Promise<AssociationEntity[]> {
    return Array.from(this.associations.values());
  }

  async listMembers(associationId: string): Promise<AssociationMemberEntity[]> {
    return Array.from(this.members.values()).filter(
      (m) => m.associationId === associationId,
    );
  }

  async findMember(
    associationId: string,
    userId: string,
  ): Promise<AssociationMemberEntity | null> {
    for (const m of this.members.values()) {
      if (m.associationId === associationId && m.userId === userId) {
        return m;
      }
    }
    return null;
  }

  async findMemberById(
    associationId: string,
    memberId: string,
  ): Promise<AssociationMemberEntity | null> {
    for (const m of this.members.values()) {
      if (m.associationId === associationId && m.id === memberId) {
        return m;
      }
    }
    return null;
  }

  async updateMemberProfessionalInfo(): Promise<void> {}

  async listCommunityLinks(
    associationId: string,
  ): Promise<AssociationCommunityLinkEntity[]> {
    return this.links.filter((l) => l.associationId === associationId);
  }

  async save(association: AssociationEntity): Promise<void> {
    this.associations.set(association.id, association);
  }

  async update(association: AssociationEntity): Promise<void> {
    this.associations.set(association.id, association);
  }

  async addMember(member: AssociationMemberEntity): Promise<void> {
    this.members.set(`${member.associationId}:${member.userId}`, member);
  }

  async updateMemberRole(member: AssociationMemberEntity): Promise<void> {
    this.members.set(`${member.associationId}:${member.userId}`, member);
  }

  async removeMember(associationId: string, userId: string): Promise<void> {
    this.members.delete(`${associationId}:${userId}`);
  }

  async linkCommunity(link: AssociationCommunityLinkEntity): Promise<void> {
    this.links.push(link);
  }

  async unlinkCommunity(associationId: string, communityId: string): Promise<void> {
    this.links = this.links.filter(
      (l) => !(l.associationId === associationId && l.communityId === communityId),
    );
  }
}

describe('Module Associations — Tests de Conformité SOLID & Multi-Rattachements N-N (Niveau 3)', () => {
  let repository: InMemoryAssociationRepository;
  let mockAuditLogger: any;

  beforeEach(() => {
    repository = new InMemoryAssociationRepository();
    mockAuditLogger = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('1. Domaine Pur : AssociationEntity & Membres', () => {
    it('devrait instancier une association valide avec ses invariants', () => {
      const id = randomUUID();
      const assoc = AssociationEntity.create({
        id,
        name: 'AJAD - Akpakpa',
        acronym: 'AJAD',
        registrationNumber: 'BEN-12345',
      });

      expect(assoc.id).toBe(id);
      expect(assoc.name).toBe('AJAD - Akpakpa');
      expect(assoc.acronym).toBe('AJAD');
      expect(assoc.registrationNumber).toBe('BEN-12345');
    });

    it('devrait refuser un nom d’association trop court ou vide', () => {
      expect(() =>
        AssociationEntity.create({
          id: randomUUID(),
          name: 'AB',
        }),
      ).toThrow("Le nom de l'association doit comporter au moins 3 caractères.");
    });

    it('devrait identifier correctement les prérogatives du bureau exécutif', () => {
      const president = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: randomUUID(),
        userId: randomUUID(),
        role: 'PRESIDENT',
      });
      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: randomUUID(),
        userId: randomUUID(),
        role: 'MEMBER',
      });

      expect(president.isExecutiveBureau()).toBe(true);
      expect(president.isPresident()).toBe(true);

      expect(member.isExecutiveBureau()).toBe(false);
      expect(member.isPresident()).toBe(false);
    });
  });

  describe('2. Cas d’Usage : RegisterAssociationUseCase', () => {
    it('devrait déclarer une association et désigner le fondateur comme PRESIDENT', async () => {
      const useCase = new RegisterAssociationUseCase(
        repository,
        repository,
        mockAuditLogger,
      );
      const presidentId = randomUUID();

      const { association, presidentMember } = await useCase.execute({
        name: 'Association des Riverains de Cotonou',
        acronym: 'ARC',
        registrationNumber: 'REC-2026-001',
        presidentUserId: presidentId,
      });

      expect(association).toBeDefined();
      expect(presidentMember.role).toBe('PRESIDENT');
      expect(presidentMember.userId).toBe(presidentId);

      const inRepo = await repository.findById(association.id);
      expect(inRepo).toBeDefined();

      const memberInRepo = await repository.findMember(association.id, presidentId);
      expect(memberInRepo?.role).toBe('PRESIDENT');

      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });

    it('devrait refuser un doublon sur le numéro d’enregistrement officiel', async () => {
      const useCase = new RegisterAssociationUseCase(repository, repository);
      const presidentId = randomUUID();

      await useCase.execute({
        name: 'Assoc 1',
        registrationNumber: 'DOUBLON-001',
        presidentUserId: presidentId,
      });

      await expect(
        useCase.execute({
          name: 'Assoc 2',
          registrationNumber: 'DOUBLON-001',
          presidentUserId: randomUUID(),
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('3. Cas d’Usage : LinkCommunityUseCase (Multi-Rattachement N-N)', () => {
    it('devrait permettre à un membre du bureau de rattacher l’association à une communauté', async () => {
      const assoc = AssociationEntity.create({
        id: randomUUID(),
        name: 'Jeunesse Active Littoral',
      });
      await repository.save(assoc);

      const presidentId = randomUUID();
      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assoc.id,
        userId: presidentId,
        role: 'PRESIDENT',
      });
      await repository.addMember(member);

      const communityId = randomUUID();
      const useCase = new LinkCommunityUseCase(
        repository,
        repository,
        undefined,
        mockAuditLogger,
      );

      const link = await useCase.execute({
        associationId: assoc.id,
        communityId,
        requesterUserId: presidentId,
      });

      expect(link.associationId).toBe(assoc.id);
      expect(link.communityId).toBe(communityId);

      const links = await repository.listCommunityLinks(assoc.id);
      expect(links).toHaveLength(1);
      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });

    it('devrait refuser le rattachement si le demandeur est un simple membre sans mandat (RBAC)', async () => {
      const assoc = AssociationEntity.create({
        id: randomUUID(),
        name: 'Jeunesse Active Littoral',
      });
      await repository.save(assoc);

      const regularMemberId = randomUUID();
      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assoc.id,
        userId: regularMemberId,
        role: 'MEMBER',
      });
      await repository.addMember(member);

      const useCase = new LinkCommunityUseCase(repository, repository);

      await expect(
        useCase.execute({
          associationId: assoc.id,
          communityId: randomUUID(),
          requesterUserId: regularMemberId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Cas d’Usage : ManageAssociationMemberUseCase', () => {
    it('devrait permettre au PRESIDENT de nommer un Trésorier', async () => {
      const assocId = randomUUID();
      const presidentId = randomUUID();
      const targetUserId = randomUUID();

      const president = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: presidentId,
        role: 'PRESIDENT',
      });
      await repository.addMember(president);

      const useCase = new ManageAssociationMemberUseCase(
        repository,
        repository,
        mockAuditLogger,
      );

      const added = await useCase.execute({
        associationId: assocId,
        requesterUserId: presidentId,
        targetUserId,
        role: 'TREASURER',
        action: 'ADD',
      });

      expect(added?.role).toBe('TREASURER');
      const inRepo = await repository.findMember(assocId, targetUserId);
      expect(inRepo?.role).toBe('TREASURER');
    });

    it('devrait refuser les nominations par un non-président', async () => {
      const assocId = randomUUID();
      const memberId = randomUUID();

      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: memberId,
        role: 'MEMBER',
      });
      await repository.addMember(member);

      const useCase = new ManageAssociationMemberUseCase(repository, repository);

      await expect(
        useCase.execute({
          associationId: assocId,
          requesterUserId: memberId,
          targetUserId: randomUUID(),
          role: 'SECRETARY',
          action: 'ADD',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('5. Requêtes et Data Mapper', () => {
    it('ListAssociationsQuery & GetAssociationQuery devraient renvoyer les données complètes', async () => {
      const assoc = AssociationEntity.create({
        id: randomUUID(),
        name: 'Club des Citoyens',
      });
      await repository.save(assoc);

      const listQuery = new ListAssociationsQuery(repository);
      const list = await listQuery.execute();
      expect(list).toHaveLength(1);

      const getQuery = new GetAssociationQuery(repository);
      const details = await getQuery.execute(assoc.id);
      expect(details.association.id).toBe(assoc.id);
    });

    it('AssociationMapper devrait formater fidèlement les entités et relations', () => {
      const assoc = AssociationEntity.create({
        id: randomUUID(),
        name: 'Assoc Test',
      });
      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assoc.id,
        userId: randomUUID(),
        role: 'PRESIDENT',
      });

      const dto = AssociationMapper.toResponseDto(assoc, [member], ['c-1']);
      expect(dto.name).toBe('Assoc Test');
      expect(dto.members).toHaveLength(1);
      expect(dto.members?.[0].role).toBe('PRESIDENT');
      expect(dto.linkedCommunityIds).toEqual(['c-1']);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CommunityEntity } from '../../src/modules/communities/domain/entities/community.entity.js';
import { CommunityReaderPort } from '../../src/modules/communities/application/ports/community-reader.port.js';
import { CommunityWriterPort } from '../../src/modules/communities/application/ports/community-writer.port.js';
import { ApproveCommunityUseCase } from '../../src/modules/communities/application/commands/approve-community.use-case.js';
import { GetCommunityQuery } from '../../src/modules/communities/application/queries/get-community.query.js';

/**
 * Adaptateur de Test en Mémoire (In-Memory Repository)
 *
 * Démonstration des Principes SOLID :
 * - LSP (Liskov Substitution) : Implémente fidèlement les contrats CommunityReaderPort et CommunityWriterPort.
 * - DIP (Dependency Inversion) : Peut être injecté partout où les abstractions sont attendues.
 * - ISP (Interface Segregation) : Implémente distinctement les deux ports ségrégués.
 */
class InMemoryCommunityRepository implements CommunityReaderPort, CommunityWriterPort {
  private readonly items = new Map<string, CommunityEntity>();

  async findById(id: string): Promise<CommunityEntity | null> {
    const item = this.items.get(id);
    return item ? CommunityEntity.create(item.toJSON()) : null;
  }

  async findBySlug(slug: string): Promise<CommunityEntity | null> {
    for (const item of this.items.values()) {
      if (item.slug === slug) {
        return CommunityEntity.create(item.toJSON());
      }
    }
    return null;
  }

  async listAll(): Promise<CommunityEntity[]> {
    return Array.from(this.items.values()).map((item) => CommunityEntity.create(item.toJSON()));
  }

  async save(community: CommunityEntity): Promise<void> {
    this.items.set(community.id, community);
  }

  async updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new NotFoundException(`Communauté ${id} introuvable pour mise à jour`);
    }
    const updated = CommunityEntity.create({
      ...existing.toJSON(),
      status,
      updatedAt: new Date(),
    });
    this.items.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

describe('Conformité aux Principes SOLID dans le Domaine Communities', () => {
  let repository: InMemoryCommunityRepository;
  let approveUseCase: ApproveCommunityUseCase;
  let getCommunityQuery: GetCommunityQuery;

  beforeEach(() => {
    // DIP : Injection directe des abstractions / adaptateurs conformes aux interfaces
    repository = new InMemoryCommunityRepository();
    approveUseCase = new ApproveCommunityUseCase(repository, repository);
    getCommunityQuery = new GetCommunityQuery(repository);
  });

  it('[SRP] Entité de Domaine : Encapsule ses invariants métier purs sans framework', () => {
    // Invariant 1 : Nom trop court
    expect(() =>
      CommunityEntity.create({
        id: 'c1',
        name: 'A',
        slug: 'cotonou',
        territoryId: 't1',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow('Le nom de la communauté doit comporter au moins 2 caractères.');

    // Invariant 2 : Slug invalide
    expect(() =>
      CommunityEntity.create({
        id: 'c1',
        name: 'Cotonou Littoral',
        slug: 'INVALID SLUG!',
        territoryId: 't1',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow('Le slug de la communauté est invalide.');
  });

  it('[ISP] GetCommunityQuery : Fonctionne avec uniquement le port de lecture (ReaderPort)', async () => {
    // Enregistrement d'une entité
    const community = CommunityEntity.create({
      id: 'c1',
      name: 'Communauté Cotonou',
      slug: 'cotonou',
      territoryId: 't1',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(community);

    // Exécution de la query (ISP : GetCommunityQuery ne dépend d'aucune méthode d'écriture)
    const result = await getCommunityQuery.execute({ communityId: 'c1' });
    expect(result.id).toBe('c1');
    expect(result.name).toBe('Communauté Cotonou');
  });

  it('[LSP & DIP] ApproveCommunityUseCase : Exécute le scénario avec un adaptateur substituable', async () => {
    const community = CommunityEntity.create({
      id: 'c2',
      name: 'Communauté Porto-Novo',
      slug: 'porto-novo',
      territoryId: 't2',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(community);

    // 1. Refus si l'acteur n'est pas Platform Admin (Règle Métier OCP)
    await expect(
      approveUseCase.execute({
        communityId: 'c2',
        adminId: 'user-regular',
        isPlatformAdmin: false,
      }),
    ).rejects.toThrow(ConflictException);

    // 2. Succès si l'acteur est Platform Admin
    const approved = await approveUseCase.execute({
      communityId: 'c2',
      adminId: 'admin-1',
      isPlatformAdmin: true,
    });

    expect(approved.status).toBe('ACTIVE');

    // 3. Vérification de la persistance via le repository substitué (LSP)
    const persisted = await repository.findById('c2');
    expect(persisted?.status).toBe('ACTIVE');
  });

  it('[SRP & OCP] Refus d\'activation si déjà active', async () => {
    const community = CommunityEntity.create({
      id: 'c3',
      name: 'Communauté Parakou',
      slug: 'parakou',
      territoryId: 't3',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(community);

    await expect(
      approveUseCase.execute({
        communityId: 'c3',
        adminId: 'admin-1',
        isPlatformAdmin: true,
      }),
    ).rejects.toThrow(ConflictException);
  });
});

import { CommunityProposalEntity } from '../../src/modules/communities/domain/entities/community-proposal.entity.js';
import { CommunityProposalReaderPort } from '../../src/modules/communities/application/ports/proposal-reader.port.js';
import { CommunityProposalWriterPort } from '../../src/modules/communities/application/ports/proposal-writer.port.js';
import { SubmitProposalUseCase } from '../../src/modules/communities/application/commands/submit-proposal.use-case.js';
import { ReviewProposalUseCase } from '../../src/modules/communities/application/commands/review-proposal.use-case.js';
import { ListProposalsQuery } from '../../src/modules/communities/application/queries/list-proposals.query.js';
import { ListCommunitiesQuery } from '../../src/modules/communities/application/queries/list-communities.query.js';
import { Slug } from '../../src/modules/communities/domain/value-objects/slug.vo.js';
import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';

class InMemoryProposalRepository
  implements CommunityProposalReaderPort, CommunityProposalWriterPort
{
  public proposals = new Map<string, CommunityProposalEntity>();

  async findById(id: string): Promise<CommunityProposalEntity | null> {
    return this.proposals.get(id) ?? null;
  }

  async findByProposedById(
    proposedById: string,
  ): Promise<CommunityProposalEntity[]> {
    return Array.from(this.proposals.values()).filter(
      (p) => p.proposedById === proposedById,
    );
  }

  async listAll(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<CommunityProposalEntity[]> {
    const list = Array.from(this.proposals.values());
    if (status) {
      return list.filter((p) => p.status === status);
    }
    return list;
  }

  async save(proposal: CommunityProposalEntity): Promise<void> {
    this.proposals.set(proposal.id, proposal);
  }

  async updateStatus(proposal: CommunityProposalEntity): Promise<void> {
    this.proposals.set(proposal.id, proposal);
  }
}

describe('Module Communities — Cycle de Vie des Propositions Citoyennes (Niveau 2)', () => {
  let proposalRepo: InMemoryProposalRepository;
  let communityRepo: InMemoryCommunityRepository;
  let mockNotifier: any;
  let mockAuditLogger: any;

  beforeEach(() => {
    proposalRepo = new InMemoryProposalRepository();
    communityRepo = new InMemoryCommunityRepository();
    mockNotifier = {
      execute: vi.fn().mockResolvedValue({} as any),
    };
    mockAuditLogger = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('Value Object : Slug', () => {
    it('devrait normaliser les accents, espaces et caractères spéciaux en kebab-case', () => {
      const slug = new Slug('Communauté Cotonou - Akpakpa Dodji !');
      expect(slug.value).toBe('communaute-cotonou-akpakpa-dodji');
    });

    it('devrait rejeter une chaîne ne produisant pas un slug valide d’au moins 2 caractères', () => {
      expect(() => new Slug('??')).toThrow('trop court');
    });
  });

  describe('Domaine : CommunityProposalEntity', () => {
    it('devrait instancier une proposition valide avec ses invariants', () => {
      const id = randomUUID();
      const territoryId = randomUUID();
      const citizenId = randomUUID();

      const proposal = CommunityProposalEntity.create({
        id,
        name: 'Quartier Fidjrossè Plage',
        description: 'Initiative pour la propreté et l’animation du littoral',
        justification: 'Forte concentration d’habitants et d’activités citoyennes sans canal dédié',
        territoryId,
        proposedById: citizenId,
      });

      expect(proposal.id).toBe(id);
      expect(proposal.status).toBe('PENDING');
      expect(proposal.reviewedById).toBeNull();
    });

    it('devrait refuser une proposition avec un nom, une description ou justification trop courte', () => {
      expect(() =>
        CommunityProposalEntity.create({
          id: 'p1',
          name: 'A',
          description: 'Longue description de plus de dix caractères',
          justification: 'Longue justification de plus de dix caractères',
          territoryId: 't1',
          proposedById: 'u1',
        }),
      ).toThrow('Le nom de la communauté proposée doit comporter au moins 2 caractères.');

      expect(() =>
        CommunityProposalEntity.create({
          id: 'p1',
          name: 'Nom valide',
          description: 'Court',
          justification: 'Longue justification de plus de dix caractères',
          territoryId: 't1',
          proposedById: 'u1',
        }),
      ).toThrow('La description de la proposition doit comporter au moins 10 caractères.');
    });

    it('devrait approuver ou rejeter une proposition en respectant les transitions d’état', () => {
      const proposal = CommunityProposalEntity.create({
        id: 'p1',
        name: 'Quartier Gbégamey',
        description: 'Description valide de plus de dix caractères',
        justification: 'Justification valide de plus de dix caractères',
        territoryId: 't1',
        proposedById: 'u1',
      });

      proposal.approve('admin-42');
      expect(proposal.status).toBe('APPROVED');
      expect(proposal.reviewedById).toBe('admin-42');

      // Interdiction de ré-approuver ou rejeter une proposition déjà traitée
      expect(() => proposal.approve('admin-99')).toThrow('déjà traitée');
      expect(() => proposal.reject('admin-99', 'Motif')).toThrow('déjà traitée');
    });
  });

  describe('Cas d’Usage : SubmitProposalUseCase', () => {
    it('devrait enregistrer la proposition et journaliser un événement d’audit', async () => {
      const useCase = new SubmitProposalUseCase(proposalRepo, mockAuditLogger);
      const citizenId = randomUUID();
      const territoryId = randomUUID();

      const created = await useCase.execute({
        name: 'Cadjehoun Centre',
        description: 'Espace citoyen pour le quartier Cadjehoun',
        justification: 'Coordination des activités locales et de quartier',
        territoryId,
        proposedById: citizenId,
      });

      expect(created).toBeDefined();
      expect(created.name).toBe('Cadjehoun Centre');

      const inRepo = await proposalRepo.findById(created.id);
      expect(inRepo).toBeDefined();
      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cas d’Usage : ReviewProposalUseCase', () => {
    it('devrait approuver une proposition, créer automatiquement la communauté et envoyer une notification', async () => {
      const citizenId = randomUUID();
      const proposal = CommunityProposalEntity.create({
        id: randomUUID(),
        name: 'Haie Vive Citoyenne',
        description: 'Espace pour les résidents de la Haie Vive',
        justification: 'Regroupement citoyen et animation locale',
        territoryId: randomUUID(),
        proposedById: citizenId,
      });
      await proposalRepo.save(proposal);

      const reviewUseCase = new ReviewProposalUseCase(
        proposalRepo,
        proposalRepo,
        communityRepo,
        communityRepo,
        mockNotifier,
        mockAuditLogger,
      );

      const result = await reviewUseCase.execute({
        proposalId: proposal.id,
        reviewerId: 'admin-1',
        decision: 'APPROVED',
      });

      expect(result.proposal.status).toBe('APPROVED');
      expect(result.community).toBeDefined();
      expect(result.community?.status).toBe('ACTIVE');
      expect(result.community?.slug).toBe('haie-vive-citoyenne');

      // Vérification que la communauté est persistée dans le reader
      const savedCommunity = await communityRepo.findById(result.community!.id);
      expect(savedCommunity).toBeDefined();
      expect(savedCommunity?.name).toBe('Haie Vive Citoyenne');

      // Vérification envoi notification
      expect(mockNotifier.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: citizenId,
          type: 'COMMUNITY_STATUS',
        }),
      );
    });

    it('devrait rejeter une proposition avec un motif argumenté et notifier le proposant', async () => {
      const citizenId = randomUUID();
      const proposal = CommunityProposalEntity.create({
        id: randomUUID(),
        name: 'Doublon Espace',
        description: 'Description valide de plus de 10 caractères',
        justification: 'Justification valide de plus de 10 caractères',
        territoryId: randomUUID(),
        proposedById: citizenId,
      });
      await proposalRepo.save(proposal);

      const reviewUseCase = new ReviewProposalUseCase(
        proposalRepo,
        proposalRepo,
        communityRepo,
        communityRepo,
        mockNotifier,
        mockAuditLogger,
      );

      const result = await reviewUseCase.execute({
        proposalId: proposal.id,
        reviewerId: 'admin-1',
        decision: 'REJECTED',
        rejectionReason: 'Territoire déjà couvert par un autre espace officiel',
      });

      expect(result.proposal.status).toBe('REJECTED');
      expect(result.proposal.rejectionReason).toBe(
        'Territoire déjà couvert par un autre espace officiel',
      );
      expect(result.community).toBeUndefined();

      expect(mockNotifier.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: citizenId,
          type: 'COMMUNITY_STATUS',
        }),
      );
    });
  });

  describe('Requêtes (Queries)', () => {
    it('ListProposalsQuery devrait filtrer par proposedById et par status', async () => {
      const u1 = randomUUID();
      const u2 = randomUUID();

      const p1 = CommunityProposalEntity.create({
        id: randomUUID(),
        name: 'P1',
        description: 'Desc de p1 de plus de 10 chars',
        justification: 'Justif de p1 de plus de 10 chars',
        territoryId: 't1',
        proposedById: u1,
        status: 'PENDING',
      });
      const p2 = CommunityProposalEntity.create({
        id: randomUUID(),
        name: 'P2',
        description: 'Desc de p2 de plus de 10 chars',
        justification: 'Justif de p2 de plus de 10 chars',
        territoryId: 't1',
        proposedById: u2,
        status: 'APPROVED',
      });

      await proposalRepo.save(p1);
      await proposalRepo.save(p2);

      const query = new ListProposalsQuery(proposalRepo);

      const forU1 = await query.execute({ proposedById: u1 });
      expect(forU1).toHaveLength(1);
      expect(forU1[0].id).toBe(p1.id);

      const pendings = await query.execute({ status: 'PENDING' });
      expect(pendings).toHaveLength(1);
      expect(pendings[0].id).toBe(p1.id);
    });

    it('ListCommunitiesQuery devrait lister les communautés', async () => {
      const c1 = CommunityEntity.create({
        id: 'c1',
        name: 'Com 1',
        slug: 'com-1',
        territoryId: 't1',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await communityRepo.save(c1);

      const query = new ListCommunitiesQuery(communityRepo);
      const list = await query.execute();
      expect(list).toHaveLength(1);
      expect(list[0].slug).toBe('com-1');
    });
  });
});

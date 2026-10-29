import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AssociationPositionEntity } from '../../src/modules/associations/domain/entities/association-position.entity.js';
import { AssociationMemberEntity } from '../../src/modules/associations/domain/entities/association-member.entity.js';
import { AssociationEntity } from '../../src/modules/associations/domain/entities/association.entity.js';
import { CreateAssociationPositionUseCase } from '../../src/modules/associations/application/commands/create-association-position.use-case.js';
import { AssignAssociationPositionUseCase } from '../../src/modules/associations/application/commands/assign-association-position.use-case.js';
import { VacateAssociationPositionUseCase } from '../../src/modules/associations/application/commands/vacate-association-position.use-case.js';
import { ListAssociationPositionsQuery } from '../../src/modules/associations/application/queries/list-association-positions.query.js';
import { AssociationReaderPort } from '../../src/modules/associations/application/ports/association-reader.port.js';
import { AssociationPositionReaderPort } from '../../src/modules/associations/application/ports/association-position-reader.port.js';
import { AssociationPositionWriterPort } from '../../src/modules/associations/application/ports/association-position-writer.port.js';
import { ForbiddenException } from '@nestjs/common';

class InMemoryPositionRepository
  implements AssociationPositionReaderPort, AssociationPositionWriterPort
{
  public positions = new Map<string, AssociationPositionEntity>();

  async listPositions(associationId: string): Promise<AssociationPositionEntity[]> {
    return Array.from(this.positions.values()).filter(
      (p) => p.associationId === associationId,
    );
  }

  async findPositionById(
    associationId: string,
    positionId: string,
  ): Promise<AssociationPositionEntity | null> {
    const p = this.positions.get(positionId);
    return p && p.associationId === associationId ? p : null;
  }

  async savePosition(position: AssociationPositionEntity): Promise<void> {
    this.positions.set(position.id, position);
  }

  async updatePosition(position: AssociationPositionEntity): Promise<void> {
    this.positions.set(position.id, position);
  }

  async deletePosition(associationId: string, positionId: string): Promise<void> {
    this.positions.delete(positionId);
  }
}

class StubAssociationReader implements Partial<AssociationReaderPort> {
  public associations = new Map<string, AssociationEntity>();
  public members = new Map<string, AssociationMemberEntity>();

  async findById(id: string): Promise<AssociationEntity | null> {
    return this.associations.get(id) ?? null;
  }

  async findMember(
    associationId: string,
    userId: string,
  ): Promise<AssociationMemberEntity | null> {
    return this.members.get(`${associationId}:${userId}`) ?? null;
  }
}

describe('Postes Associatifs & Organigramme — Tests de Conformité SOLID (Niveau 3)', () => {
  let positionRepo: InMemoryPositionRepository;
  let assocReader: StubAssociationReader;
  let mockAuditLogger: any;

  const associationId = randomUUID();
  const presidentUserId = randomUUID();
  const citizenUserId = randomUUID();
  const targetMemberUserId = randomUUID();

  beforeEach(() => {
    positionRepo = new InMemoryPositionRepository();
    assocReader = new StubAssociationReader();
    mockAuditLogger = { log: vi.fn().mockResolvedValue(undefined) };

    // Initialiser l'association et son Président
    assocReader.associations.set(
      associationId,
      AssociationEntity.create({
        id: associationId,
        name: 'Association des Jeunes de Calavi',
        acronym: 'AJC',
      }),
    );

    assocReader.members.set(
      `${associationId}:${presidentUserId}`,
      AssociationMemberEntity.create({
        id: randomUUID(),
        associationId,
        userId: presidentUserId,
        role: 'PRESIDENT',
      }),
    );

    assocReader.members.set(
      `${associationId}:${citizenUserId}`,
      AssociationMemberEntity.create({
        id: randomUUID(),
        associationId,
        userId: citizenUserId,
        role: 'MEMBER',
      }),
    );

    assocReader.members.set(
      `${associationId}:${targetMemberUserId}`,
      AssociationMemberEntity.create({
        id: randomUUID(),
        associationId,
        userId: targetMemberUserId,
        role: 'MEMBER',
      }),
    );
  });

  it('devrait garantir les invariants du domaine lors de la création d’un poste', () => {
    expect(() =>
      AssociationPositionEntity.create({
        id: '',
        associationId,
        title: 'Responsable',
      }),
    ).toThrow("L'identifiant du poste est obligatoire.");

    expect(() =>
      AssociationPositionEntity.create({
        id: randomUUID(),
        associationId,
        title: 'A',
      }),
    ).toThrow('Le titre du poste doit comporter au moins 2 caractères.');

    const pos = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Chargé aux Résidences & Logements',
      department: 'Commission Patrimoine',
      roleCategory: 'BOARD_MEMBER',
    });

    expect(pos.isVacant()).toBe(true);
    expect(pos.isOccupied()).toBe(false);
    expect(pos.status).toBe('VACANT');
    expect(pos.department).toBe('Commission Patrimoine');
  });

  it('devrait permettre au Président de créer un nouveau poste avec succès', async () => {
    const useCase = new CreateAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      mockAuditLogger,
    );

    const position = await useCase.execute({
      associationId,
      requesterUserId: presidentUserId,
      title: 'Secrétaire Général Adjoint',
      department: 'Secrétariat & Administration',
      roleCategory: 'SECRETARY',
      description: 'Assiste le Secrétaire Général dans ses missions',
    });

    expect(position.id).toBeDefined();
    expect(position.title).toBe('Secrétaire Général Adjoint');
    expect(position.department).toBe('Secrétariat & Administration');
    expect(position.roleCategory).toBe('SECRETARY');

    const stored = await positionRepo.findPositionById(associationId, position.id);
    expect(stored).toBeDefined();
    expect(mockAuditLogger.log).toHaveBeenCalled();
  });

  it('devrait refuser la création de poste à un membre non-Président (Contextual RBAC)', async () => {
    const useCase = new CreateAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      mockAuditLogger,
    );

    await expect(
      useCase.execute({
        associationId,
        requesterUserId: citizenUserId, // Simple membre
        title: 'Commissaire aux Comptes',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('devrait affecter / nommer un membre à un poste vacant et tracer la nomination', async () => {
    const position = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Trésorier Adjoint',
      roleCategory: 'TREASURER',
    });
    await positionRepo.savePosition(position);

    const useCase = new AssignAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      positionRepo,
      mockAuditLogger,
    );

    const updated = await useCase.execute({
      associationId,
      positionId: position.id,
      requesterUserId: presidentUserId,
      targetUserId: targetMemberUserId,
      targetUserName: 'Sèna Dossou',
    });

    expect(updated.isOccupied()).toBe(true);
    expect(updated.assignedUserId).toBe(targetMemberUserId);
    expect(updated.assignedUserName).toBe('Sèna Dossou');
    expect(updated.termStartDate).toBeDefined();
    expect(mockAuditLogger.log).toHaveBeenCalled();
  });

  it('devrait refuser la nomination d’une personne non-membre de l’association', async () => {
    const position = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Chargé de Mission',
    });
    await positionRepo.savePosition(position);

    const useCase = new AssignAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      positionRepo,
      mockAuditLogger,
    );

    const nonMemberUserId = randomUUID();
    await expect(
      useCase.execute({
        associationId,
        positionId: position.id,
        requesterUserId: presidentUserId,
        targetUserId: nonMemberUserId,
        targetUserName: 'Inconnu',
      }),
    ).rejects.toThrow("Seul un membre adhérent enregistré de l'association peut être nommé à ce poste.");
  });

  it('devrait libérer un poste / le rendre vacant lors d’une fin de mandat', async () => {
    const position = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Chargé à la Communication',
      assignedUserId: targetMemberUserId,
      assignedUserName: 'Bonaventure Bio',
    });
    await positionRepo.savePosition(position);

    const useCase = new VacateAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      positionRepo,
      mockAuditLogger,
    );

    const vacated = await useCase.execute({
      associationId,
      positionId: position.id,
      requesterUserId: presidentUserId,
    });

    expect(vacated.isVacant()).toBe(true);
    expect(vacated.assignedUserId).toBeNull();
    expect(vacated.assignedUserName).toBeNull();
  });

  it('devrait interdire la vacance directe du poste statutaire de Président', async () => {
    const statutoryPresident = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Président du Bureau Exécutif',
      roleCategory: 'PRESIDENT',
      assignedUserId: presidentUserId,
      assignedUserName: 'Sèdami Akindès',
      isStatutory: true,
    });
    await positionRepo.savePosition(statutoryPresident);

    const useCase = new VacateAssociationPositionUseCase(
      assocReader as any,
      positionRepo,
      positionRepo,
      mockAuditLogger,
    );

    await expect(
      useCase.execute({
        associationId,
        positionId: statutoryPresident.id,
        requesterUserId: presidentUserId,
      }),
    ).rejects.toThrow('Le poste statutaire de Président ne peut pas être rendu vacant directement.');
  });

  it('devrait lister l’organigramme complet des postes d’une association', async () => {
    const pos1 = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Président',
      roleCategory: 'PRESIDENT',
    });
    const pos2 = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Chargé aux Résidences',
      roleCategory: 'BOARD_MEMBER',
    });

    await positionRepo.savePosition(pos1);
    await positionRepo.savePosition(pos2);

    const query = new ListAssociationPositionsQuery(assocReader as any, positionRepo);
    const list = await query.execute(associationId);

    expect(list).toHaveLength(2);
    expect(list.map((p) => p.title)).toContain('Chargé aux Résidences');
  });

  it('devrait permettre au Président de configurer les espaces d’accès et permissions d’un poste', async () => {
    const position = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId,
      title: 'Chargé de Mission Spéciale',
      roleCategory: 'BOARD_MEMBER',
      department: 'Commission Spéciale',
    });
    await positionRepo.savePosition(position);

    const { UpdatePositionPermissionsUseCase } = await import(
      '../../src/modules/associations/application/commands/update-position-permissions.use-case.js'
    );

    const useCase = new UpdatePositionPermissionsUseCase(
      assocReader as any,
      positionRepo,
      positionRepo,
      mockAuditLogger,
    );

    const updated = await useCase.execute({
      associationId,
      positionId: position.id,
      requesterUserId: presidentUserId,
      accessSpaces: ['RESIDENCES', 'COMMUNICATION'],
      permissions: ['residences:read', 'residences:issue_certificate', 'communication:publish_posts'],
    });

    expect(updated.accessSpaces).toEqual(['RESIDENCES', 'COMMUNICATION']);
    expect(updated.hasAccessToSpace('RESIDENCES')).toBe(true);
    expect(updated.hasAccessToSpace('FINANCE')).toBe(false);
    expect(updated.hasPermission('residences:issue_certificate')).toBe(true);
    expect(updated.hasPermission('finance:manage_expenses')).toBe(false);
    expect(mockAuditLogger.log).toHaveBeenCalled();
  });
});

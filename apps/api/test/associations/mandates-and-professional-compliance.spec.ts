import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AssociationEntity } from '../../src/modules/associations/domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../src/modules/associations/domain/entities/association-member.entity.js';
import { AssociationMandateEntity } from '../../src/modules/associations/domain/entities/association-mandate.entity.js';
import { AssociationPositionEntity } from '../../src/modules/associations/domain/entities/association-position.entity.js';
import { CreateAssociationMandateUseCase } from '../../src/modules/associations/application/commands/create-association-mandate.use-case.js';
import { UpdateAssociationMandateUseCase } from '../../src/modules/associations/application/commands/update-association-mandate.use-case.js';
import { ActivateAssociationMandateUseCase } from '../../src/modules/associations/application/commands/activate-association-mandate.use-case.js';
import { ExecuteServiceHandoverUseCase } from '../../src/modules/associations/application/commands/execute-service-handover.use-case.js';
import { UpdateMemberProfessionalInfoUseCase } from '../../src/modules/associations/application/commands/update-member-professional-info.use-case.js';
import { ListAssociationMandatesQuery } from '../../src/modules/associations/application/queries/list-association-mandates.query.js';
import { AssociationReaderPort } from '../../src/modules/associations/application/ports/association-reader.port.js';
import { AssociationWriterPort } from '../../src/modules/associations/application/ports/association-writer.port.js';
import { AssociationPositionReaderPort } from '../../src/modules/associations/application/ports/association-position-reader.port.js';
import { AssociationPositionWriterPort } from '../../src/modules/associations/application/ports/association-position-writer.port.js';
import { AssociationMandateReaderPort } from '../../src/modules/associations/application/ports/association-mandate-reader.port.js';
import { AssociationMandateWriterPort } from '../../src/modules/associations/application/ports/association-mandate-writer.port.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

class TestAssociationRepository implements AssociationReaderPort, AssociationWriterPort {
  public associations = new Map<string, AssociationEntity>();
  public members = new Map<string, AssociationMemberEntity>();

  async findById(id: string): Promise<AssociationEntity | null> {
    return this.associations.get(id) ?? null;
  }
  async findByRegistrationNumber(): Promise<AssociationEntity | null> {
    return null;
  }
  async listAll(): Promise<AssociationEntity[]> {
    return Array.from(this.associations.values());
  }
  async listMembers(associationId: string): Promise<AssociationMemberEntity[]> {
    return Array.from(this.members.values()).filter((m) => m.associationId === associationId);
  }
  async findMember(associationId: string, userId: string): Promise<AssociationMemberEntity | null> {
    for (const m of this.members.values()) {
      if (m.associationId === associationId && m.userId === userId) return m;
    }
    return null;
  }
  async findMemberById(associationId: string, memberId: string): Promise<AssociationMemberEntity | null> {
    const m = this.members.get(memberId);
    return m && m.associationId === associationId ? m : null;
  }
  async listCommunityLinks(): Promise<any[]> {
    return [];
  }
  async save(association: AssociationEntity): Promise<void> {
    this.associations.set(association.id, association);
  }
  async update(association: AssociationEntity): Promise<void> {
    this.associations.set(association.id, association);
  }
  async addMember(member: AssociationMemberEntity): Promise<void> {
    this.members.set(member.id, member);
  }
  async updateMemberRole(member: AssociationMemberEntity): Promise<void> {
    this.members.set(member.id, member);
  }
  async updateMemberProfessionalInfo(associationId: string, memberId: string, info: any): Promise<void> {
    const m = this.members.get(memberId);
    if (m) m.updateProfessionalInfo(info);
  }
  async removeMember(associationId: string, userId: string): Promise<void> {
    for (const [key, val] of this.members.entries()) {
      if (val.associationId === associationId && val.userId === userId) {
        this.members.delete(key);
      }
    }
  }
  async linkCommunity(): Promise<void> {}
  async unlinkCommunity(): Promise<void> {}
}

class TestMandateRepository implements AssociationMandateReaderPort, AssociationMandateWriterPort {
  public mandates = new Map<string, AssociationMandateEntity>();

  async listMandates(associationId: string): Promise<AssociationMandateEntity[]> {
    return Array.from(this.mandates.values()).filter((m) => m.associationId === associationId);
  }
  async findMandateById(associationId: string, mandateId: string): Promise<AssociationMandateEntity | null> {
    const m = this.mandates.get(mandateId);
    return m && m.associationId === associationId ? m : null;
  }
  async findActiveMandate(associationId: string): Promise<AssociationMandateEntity | null> {
    return Array.from(this.mandates.values()).find((m) => m.associationId === associationId && m.isActive()) ?? null;
  }
  async saveMandate(mandate: AssociationMandateEntity): Promise<void> {
    this.mandates.set(mandate.id, mandate);
  }
  async updateMandate(mandate: AssociationMandateEntity): Promise<void> {
    this.mandates.set(mandate.id, mandate);
  }
  async deleteMandate(associationId: string, mandateId: string): Promise<void> {
    this.mandates.delete(mandateId);
  }
}

class TestPositionRepository implements AssociationPositionReaderPort, AssociationPositionWriterPort {
  public positions = new Map<string, AssociationPositionEntity>();

  async listPositions(associationId: string): Promise<AssociationPositionEntity[]> {
    return Array.from(this.positions.values()).filter((p) => p.associationId === associationId);
  }
  async findPositionById(associationId: string, positionId: string): Promise<AssociationPositionEntity | null> {
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

describe('Gouvernance : Mandatures, Passation de Service & Profil Professionnel (SOLID)', () => {
  let assocRepo: TestAssociationRepository;
  let mandateRepo: TestMandateRepository;
  let positionRepo: TestPositionRepository;

  let createMandateUseCase: CreateAssociationMandateUseCase;
  let updateMandateUseCase: UpdateAssociationMandateUseCase;
  let activateMandateUseCase: ActivateAssociationMandateUseCase;
  let handoverUseCase: ExecuteServiceHandoverUseCase;
  let updateProInfoUseCase: UpdateMemberProfessionalInfoUseCase;
  let listMandatesQuery: ListAssociationMandatesQuery;

  beforeEach(() => {
    assocRepo = new TestAssociationRepository();
    mandateRepo = new TestMandateRepository();
    positionRepo = new TestPositionRepository();

    createMandateUseCase = new CreateAssociationMandateUseCase(
      assocRepo,
      assocRepo,
      mandateRepo,
      mandateRepo,
    );
    updateMandateUseCase = new UpdateAssociationMandateUseCase(
      assocRepo,
      mandateRepo,
      mandateRepo,
    );
    activateMandateUseCase = new ActivateAssociationMandateUseCase(
      assocRepo,
      assocRepo,
      mandateRepo,
      mandateRepo,
    );
    handoverUseCase = new ExecuteServiceHandoverUseCase(
      assocRepo,
      assocRepo,
      positionRepo,
      positionRepo,
      mandateRepo,
      mandateRepo,
    );
    updateProInfoUseCase = new UpdateMemberProfessionalInfoUseCase(
      assocRepo,
      assocRepo,
    );
    listMandatesQuery = new ListAssociationMandatesQuery(mandateRepo);
  });

  describe('1. Gestion Totale & Dynamique de la Mandature (Zéro Valeur en Dur)', () => {
    it('devrait permettre de créer une mandature avec titre, période et bureau entièrement dynamiques', async () => {
      const assocId = randomUUID();
      const presId = randomUUID();

      const assoc = AssociationEntity.create({
        id: assocId,
        name: 'Amicale des Juristes & Avocats du Bénin',
        category: 'PROFESSIONAL',
      });
      await assocRepo.save(assoc);

      const presMember = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: presId,
        role: 'PRESIDENT',
      });
      await assocRepo.addMember(presMember);

      const secId = randomUUID();
      const secMember = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: secId,
        role: 'MEMBER',
      });
      await assocRepo.addMember(secMember);

      const mandate = await createMandateUseCase.execute({
        associationId: assocId,
        requesterUserId: presId,
        title: 'Mandat Éthique, Droit & Numérique',
        academicYear: '2026-2028',
        startDate: new Date('2026-10-01'),
        description: 'Cap sur l’assistance juridique solidaire et l’insertion des jeunes diplômés.',
        presidentUserId: presId,
        presidentName: 'Me Aurel Kpossou',
        secretaryUserId: secId,
        secretaryName: 'Me Estelle Dossou',
        setAsActive: true,
      });

      expect(mandate.id).toBeDefined();
      expect(mandate.title).toBe('Mandat Éthique, Droit & Numérique');
      expect(mandate.academicYear).toBe('2026-2028');
      expect(mandate.isActive()).toBe(true);
      expect(mandate.officers).toHaveLength(2);

      const list = await listMandatesQuery.execute(assocId);
      expect(list).toHaveLength(1);
      expect(list[0].title).toBe('Mandat Éthique, Droit & Numérique');
    });

    it('devrait permettre de modifier les informations d’une mandature sans valeur figée', async () => {
      const assocId = randomUUID();
      const presId = randomUUID();
      const assoc = AssociationEntity.create({ id: assocId, name: 'Assoc Pro' });
      await assocRepo.save(assoc);
      await assocRepo.addMember(AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: presId,
        role: 'PRESIDENT',
      }));

      const mandate = await createMandateUseCase.execute({
        associationId: assocId,
        requesterUserId: presId,
        title: 'Mandat Initial',
        academicYear: '2026-2027',
        startDate: new Date('2026-01-01'),
        presidentUserId: presId,
        presidentName: 'President Test',
      });

      const updated = await updateMandateUseCase.execute({
        associationId: assocId,
        mandateId: mandate.id,
        requesterUserId: presId,
        title: 'Mandat Rénovation & Croissance 2026-2029',
        academicYear: '2026-2029',
      });

      expect(updated.title).toBe('Mandat Rénovation & Croissance 2026-2029');
      expect(updated.academicYear).toBe('2026-2029');
    });
  });

  describe('2. Passation de Service (Transmission de Pouvoirs & Clôture de Mandat)', () => {
    it('devrait clôturer le mandat sortant, promouvoir le nouveau bureau et acter la passation financière', async () => {
      const assocId = randomUUID();
      const oldPresId = randomUUID();
      const newPresId = randomUUID();

      const assoc = AssociationEntity.create({ id: assocId, name: 'Amicale Étudiante Campus' });
      await assocRepo.save(assoc);

      await assocRepo.addMember(AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: oldPresId,
        role: 'PRESIDENT',
      }));
      await assocRepo.addMember(AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: assocId,
        userId: newPresId,
        role: 'MEMBER',
      }));

      const statutoryPresPos = AssociationPositionEntity.create({
        id: `stat-pres-${assocId}`,
        associationId: assocId,
        title: 'Président(e)',
        roleCategory: 'PRESIDENT',
        department: 'BUREAU_EXECUTIF',
        description: 'Direction',
        isStatutory: true,
      });
      await positionRepo.savePosition(statutoryPresPos);

      // Créer mandat actif sortant
      const outgoingMandate = await createMandateUseCase.execute({
        associationId: assocId,
        requesterUserId: oldPresId,
        title: 'Mandat Sortant 2024-2026',
        academicYear: '2024-2026',
        startDate: new Date('2024-10-01'),
        presidentUserId: oldPresId,
        presidentName: 'Ancien Président',
        setAsActive: true,
      });

      // Exécuter passation de service
      const handoverResult = await handoverUseCase.execute({
        associationId: assocId,
        requesterUserId: oldPresId,
        mandateTitle: 'Mandat Nouveau Souffle 2026-2028',
        academicYear: '2026-2028',
        handoverDate: new Date('2026-10-15'),
        treasuryTransferredAmount: 520000,
        handoverNotes: 'Remise des registres, du solde de caisse et des clés des pavillons.',
        pvDocumentRef: 'PV-HANDOVER-2026-001',
        newPresident: {
          userId: newPresId,
          userName: 'Nouveau Président Élu',
        },
      });

      expect(handoverResult.previousMandate?.isCompleted()).toBe(true);
      expect(handoverResult.previousMandate?.treasuryTransferredAmount).toBe(520000);
      expect(handoverResult.newMandate.isActive()).toBe(true);
      expect(handoverResult.newMandate.title).toBe('Mandat Nouveau Souffle 2026-2028');

      // Ancien président rétrogradé à MEMBER
      const oldPresUpdated = await assocRepo.findMember(assocId, oldPresId);
      expect(oldPresUpdated?.role).toBe('MEMBER');

      // Nouveau président promu à PRESIDENT
      const newPresUpdated = await assocRepo.findMember(assocId, newPresId);
      expect(newPresUpdated?.role).toBe('PRESIDENT');
    });
  });

  describe('3. Règle Métier Absolue : Informations Professionnelles par Typologie', () => {
    it('devrait accepter l’insertion des informations professionnelles pour une association PROFESSIONNELLE', async () => {
      const assocId = randomUUID();
      const userId = randomUUID();
      const memberId = randomUUID();

      const assoc = AssociationEntity.create({
        id: assocId,
        name: 'Ordre Professionnel des Ingénieurs Informaticiens',
        category: 'PROFESSIONAL',
      });
      await assocRepo.save(assoc);

      const member = AssociationMemberEntity.create({
        id: memberId,
        associationId: assocId,
        userId,
        role: 'MEMBER',
      });
      await assocRepo.addMember(member);

      const updated = await updateProInfoUseCase.execute({
        associationId: assocId,
        memberId,
        requesterUserId: userId,
        professionalInfo: {
          currentJobTitle: 'Architecte Logiciel Senior',
          companyOrOrganization: 'Fintech West Africa',
          industrySector: 'Technologies Financières',
          yearsOfExperience: 8,
          highestDegree: 'Doctorat en Informatique',
          skills: ['TypeScript', 'NestJS', 'PostgreSQL', 'Cloud'],
          linkedinUrl: 'https://linkedin.com/in/architecte-pro',
          isAvailableForMentoring: true,
        },
      });

      expect(updated.professionalInfo).toBeDefined();
      expect(updated.professionalInfo?.currentJobTitle).toBe('Architecte Logiciel Senior');
      expect(updated.professionalInfo?.isAvailableForMentoring).toBe(true);
    });

    it('devrait accepter l’insertion des informations professionnelles pour une association ÉDUCATIVE', async () => {
      const assocId = randomUUID();
      const userId = randomUUID();
      const memberId = randomUUID();

      const assoc = AssociationEntity.create({
        id: assocId,
        name: 'Amicale des Étudiants et Alumni de la Faculté des Sciences',
        category: 'EDUCATIONAL',
      });
      await assocRepo.save(assoc);

      const member = AssociationMemberEntity.create({
        id: memberId,
        associationId: assocId,
        userId,
        role: 'MEMBER',
      });
      await assocRepo.addMember(member);

      const updated = await updateProInfoUseCase.execute({
        associationId: assocId,
        memberId,
        requesterUserId: userId,
        professionalInfo: {
          currentJobTitle: 'Chercheur Post-Doctorant',
          companyOrOrganization: 'Laboratoire de Bio-Informatique UAC',
          industrySector: 'Enseignement Supérieur & Recherche',
          skills: ['Bio-informatique', 'Python'],
        },
      });

      expect(updated.professionalInfo?.currentJobTitle).toBe('Chercheur Post-Doctorant');
    });

    it('devrait STRICTEMENT REFUSER l’insertion des informations professionnelles pour une association CITOYENNE/COMMUNAUTAIRE', async () => {
      const assocId = randomUUID();
      const userId = randomUUID();
      const memberId = randomUUID();

      // Association purement citoyenne / quartier (COMMUNITY)
      const assoc = AssociationEntity.create({
        id: assocId,
        name: 'Collectif des Habitants du Quartier Zongo',
        category: 'COMMUNITY',
      });
      await assocRepo.save(assoc);

      const member = AssociationMemberEntity.create({
        id: memberId,
        associationId: assocId,
        userId,
        role: 'MEMBER',
      });
      await assocRepo.addMember(member);

      await expect(
        updateProInfoUseCase.execute({
          associationId: assocId,
          memberId,
          requesterUserId: userId,
          professionalInfo: {
            currentJobTitle: 'Commerçant',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

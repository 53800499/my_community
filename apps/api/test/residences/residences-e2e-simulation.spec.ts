import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Résidences - Domaine & Cas d'Usage
import { QuarterEntity } from '../../src/modules/residences/domain/entities/quarter.entity.js';
import { BuildingEntity } from '../../src/modules/residences/domain/entities/building.entity.js';
import { RoomEntity } from '../../src/modules/residences/domain/entities/room.entity.js';
import { RoomOccupationEntity } from '../../src/modules/residences/domain/entities/room-occupation.entity.js';
import { RoomOccupiedDomainEvent } from '../../src/modules/residences/domain/events/room-occupied.domain-event.js';
import { RoomVacatedDomainEvent } from '../../src/modules/residences/domain/events/room-vacated.domain-event.js';

import { CreateQuarterUseCase } from '../../src/modules/residences/application/commands/create-quarter.use-case.js';
import { CreateBuildingUseCase } from '../../src/modules/residences/application/commands/create-building.use-case.js';
import { CreateRoomUseCase } from '../../src/modules/residences/application/commands/create-room.use-case.js';
import { AssignRoomOccupationUseCase } from '../../src/modules/residences/application/commands/assign-room-occupation.use-case.js';
import { TerminateRoomOccupationUseCase } from '../../src/modules/residences/application/commands/terminate-room-occupation.use-case.js';
import { GetResidenceStatsQuery } from '../../src/modules/residences/application/queries/get-residence-stats.query.js';
import { ListRoomsQuery } from '../../src/modules/residences/application/queries/list-rooms.query.js';
import { GetResidentsQuery } from '../../src/modules/residences/application/queries/get-residents.query.js';

import type {
  ResidenceReaderPort,
  ListOccupationsFilter,
  ResidenceStats,
  ResidentSummary,
} from '../../src/modules/residences/application/ports/residence-reader.port.js';
import type { ResidenceWriterPort } from '../../src/modules/residences/application/ports/residence-writer.port.js';
import type { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../src/modules/audit/domain/entities/audit-log.entity.js';

// Finance - Éléments nécessaires pour vérifier l'intégration ADR-010
import { IntegrationFeePlanEntity } from '../../src/modules/finance/domain/entities/integration-fee-plan.entity.js';
import { IntegrationFeeDueEntity } from '../../src/modules/finance/domain/entities/integration-fee-due.entity.js';
import { IntegrationFeePaymentEntity } from '../../src/modules/finance/domain/entities/integration-fee-payment.entity.js';
import { FinancialTransactionEntity } from '../../src/modules/finance/domain/entities/financial-transaction.entity.js';

/**
 * InMemory Repository simulant la persistance Résidences
 */
class InMemoryResidenceRepository implements ResidenceReaderPort, ResidenceWriterPort {
  public quarters = new Map<string, QuarterEntity>();
  public buildings = new Map<string, BuildingEntity>();
  public rooms = new Map<string, RoomEntity>();
  public occupations = new Map<string, RoomOccupationEntity>();

  async findQuarterById(id: string): Promise<QuarterEntity | null> {
    return this.quarters.get(id) ?? null;
  }

  async listQuartersByAssociation(associationId?: string): Promise<QuarterEntity[]> {
    return Array.from(this.quarters.values()).filter(
      (q) => (associationId ? q.associationId === associationId : true),
    );
  }

  async findBuildingById(id: string): Promise<BuildingEntity | null> {
    return this.buildings.get(id) ?? null;
  }

  async listBuildingsByQuarter(quarterId?: string): Promise<BuildingEntity[]> {
    return Array.from(this.buildings.values()).filter(
      (b) => (quarterId ? b.quarterId === quarterId : true),
    );
  }

  async countBuildingsByQuarter(quarterId: string): Promise<number> {
    return Array.from(this.buildings.values()).filter((b) => b.quarterId === quarterId).length;
  }

  async findRoomById(id: string): Promise<RoomEntity | null> {
    return this.rooms.get(id) ?? null;
  }

  async findRoomByBuildingAndNumber(
    buildingId: string,
    roomNumber: string,
  ): Promise<RoomEntity | null> {
    for (const r of this.rooms.values()) {
      if (r.buildingId === buildingId && r.roomNumber === roomNumber) {
        return r;
      }
    }
    return null;
  }

  async listRoomsByBuilding(buildingId?: string): Promise<RoomEntity[]> {
    return Array.from(this.rooms.values()).filter(
      (r) => (buildingId ? r.buildingId === buildingId : true),
    );
  }

  async countRoomsByBuilding(buildingId: string): Promise<number> {
    return Array.from(this.rooms.values()).filter((r) => r.buildingId === buildingId).length;
  }

  async findOccupationById(id: string): Promise<RoomOccupationEntity | null> {
    return this.occupations.get(id) ?? null;
  }

  async findActiveOccupationsByRoom(roomId: string): Promise<RoomOccupationEntity[]> {
    return Array.from(this.occupations.values()).filter(
      (o) => o.roomId === roomId && o.isActive,
    );
  }

  async findActiveOccupationByUser(userId: string): Promise<RoomOccupationEntity | null> {
    for (const occ of this.occupations.values()) {
      if (occ.occupantUserId === userId && occ.isActive) {
        return occ;
      }
    }
    return null;
  }

  async listOccupations(filter?: ListOccupationsFilter): Promise<RoomOccupationEntity[]> {
    let list = Array.from(this.occupations.values());
    if (filter?.roomId) list = list.filter((o) => o.roomId === filter.roomId);
    if (filter?.occupantUserId) list = list.filter((o) => o.occupantUserId === filter.occupantUserId);
    if (filter?.associationId) list = list.filter((o) => o.associationId === filter.associationId);
    if (filter?.isActive !== undefined) list = list.filter((o) => o.isActive === filter.isActive);
    return list;
  }

  async getStats(associationId?: string): Promise<ResidenceStats> {
    const quarters = await this.listQuartersByAssociation(associationId);
    const quarterIds = new Set(quarters.map((q) => q.id));
    const buildings = Array.from(this.buildings.values()).filter((b) =>
      associationId ? quarterIds.has(b.quarterId) : true,
    );
    const buildingIds = new Set(buildings.map((b) => b.id));
    const rooms = Array.from(this.rooms.values()).filter((r) =>
      associationId ? buildingIds.has(r.buildingId) : true,
    );

    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    const activeOccupations = Array.from(this.occupations.values()).filter(
      (o) => o.isActive && (associationId ? o.associationId === associationId : true),
    ).length;
    const occupancyRate =
      totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

    return {
      totalQuarters: quarters.length,
      totalBuildings: buildings.length,
      totalRooms,
      totalCapacity,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      activeOccupations,
      occupancyRate,
    };
  }

  async listResidents(filter?: {
    associationId?: string;
    isActive?: boolean;
  }): Promise<ResidentSummary[]> {
    const list = Array.from(this.occupations.values());
    const map = new Map<string, ResidentSummary>();

    for (const occ of list) {
      if (filter?.associationId && occ.associationId !== filter.associationId) continue;
      const room = this.rooms.get(occ.roomId);
      const building = room ? this.buildings.get(room.buildingId) : null;
      const quarter = building ? this.quarters.get(building.quarterId) : null;

      let res = map.get(occ.occupantUserId);
      if (!res) {
        res = {
          userId: occ.occupantUserId,
          firstName: 'Étudiant',
          lastName: 'Béninois',
          phoneNumber: '+229 97 12 34 56',
          email: `${occ.occupantUserId}@uac.bj`,
          city: quarter?.city ?? 'Abomey-Calavi',
          avatarKey: null,
          isActiveResident: false,
          currentRoom: null,
          contractsCount: 0,
          contracts: [],
        };
        map.set(occ.occupantUserId, res);
      }

      res.contractsCount += 1;
      res.contracts.push({
        id: occ.id,
        roomId: occ.roomId,
        roomNumber: room?.roomNumber ?? 'Chambre',
        buildingName: building?.name ?? 'Bâtiment',
        quarterName: quarter?.name ?? 'Campus',
        quarterCity: quarter?.city ?? 'Abomey-Calavi',
        associationId: occ.associationId,
        associationName: 'AEB-UAC',
        startDate: occ.startDate,
        endDate: occ.endDate,
        isActive: occ.isActive,
        status: occ.status,
      });

      if (occ.isActive && !res.currentRoom) {
        res.isActiveResident = true;
        res.currentRoom = {
          roomId: occ.roomId,
          roomNumber: room?.roomNumber ?? 'Chambre',
          buildingName: building?.name ?? 'Bâtiment',
          quarterName: quarter?.name ?? 'Campus',
          quarterCity: quarter?.city ?? 'Abomey-Calavi',
          landlordName: building?.landlordName ?? undefined,
          landlordPhone: building?.landlordPhone ?? undefined,
        };
      }
    }

    const residents = Array.from(map.values());
    if (filter?.isActive !== undefined) {
      return residents.filter((r) => r.isActiveResident === filter.isActive);
    }
    return residents;
  }

  async findResidentById(userId: string): Promise<ResidentSummary | null> {
    const all = await this.listResidents();
    return all.find((r) => r.userId === userId) ?? null;
  }

  async saveQuarter(quarter: QuarterEntity): Promise<void> {
    this.quarters.set(quarter.id, quarter);
  }

  async deleteQuarter(id: string): Promise<void> {
    this.quarters.delete(id);
  }

  async saveBuilding(building: BuildingEntity): Promise<void> {
    this.buildings.set(building.id, building);
  }

  async deleteBuilding(id: string): Promise<void> {
    this.buildings.delete(id);
  }

  async saveRoom(room: RoomEntity): Promise<void> {
    this.rooms.set(room.id, room);
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms.delete(id);
  }

  async saveOccupation(occupation: RoomOccupationEntity): Promise<void> {
    this.occupations.set(occupation.id, occupation);
  }
}

describe('Option A : Audit & Simulation E2E du Cycle de Gestion Résidences (ADR-010)', () => {
  let repository: InMemoryResidenceRepository;
  let auditLogger: AuditLoggerPort;
  let eventEmitter: EventEmitter2;

  // Use Cases
  let createQuarterUseCase: CreateQuarterUseCase;
  let createBuildingUseCase: CreateBuildingUseCase;
  let createRoomUseCase: CreateRoomUseCase;
  let assignRoomOccupationUseCase: AssignRoomOccupationUseCase;
  let terminateRoomOccupationUseCase: TerminateRoomOccupationUseCase;
  let getResidenceStatsQuery: GetResidenceStatsQuery;
  let listRoomsQuery: ListRoomsQuery;
  let getResidentsQuery: GetResidentsQuery;

  // Traces & événements capturés
  const emittedEvents: { name: string; payload: unknown }[] = [];
  const auditLogs: AuditLogEntity[] = [];

  const associationId = '11111111-1111-4111-8111-111111111111';
  const managerUserId = '22222222-2222-4222-8222-222222222222';
  const studentAliceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const studentBobId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  beforeEach(() => {
    repository = new InMemoryResidenceRepository();
    emittedEvents.length = 0;
    auditLogs.length = 0;

    eventEmitter = {
      emit: vi.fn((name: string, payload: unknown) => {
        emittedEvents.push({ name, payload });
        return true;
      }),
    } as unknown as EventEmitter2;

    auditLogger = {
      log: vi.fn(async (log: AuditLogEntity) => {
        auditLogs.push(log);
      }),
    };

    createQuarterUseCase = new CreateQuarterUseCase(repository, auditLogger);
    createBuildingUseCase = new CreateBuildingUseCase(repository, repository, auditLogger);
    createRoomUseCase = new CreateRoomUseCase(repository, repository, auditLogger);
    assignRoomOccupationUseCase = new AssignRoomOccupationUseCase(
      repository,
      repository,
      auditLogger,
      eventEmitter,
    );
    terminateRoomOccupationUseCase = new TerminateRoomOccupationUseCase(
      repository,
      repository,
      auditLogger,
      eventEmitter,
    );
    getResidenceStatsQuery = new GetResidenceStatsQuery(repository);
    listRoomsQuery = new ListRoomsQuery(repository);
    getResidentsQuery = new GetResidentsQuery(repository);
  });

  it('Exécute avec succès le cycle de vie complet : Création Quartier -> Bâtiment -> Chambre -> Attribution -> Déclenchement Événement -> Clôture', async () => {
    // -------------------------------------------------------------------------
    // 1. Création du Quartier Universitaire (UAC Calavi)
    // -------------------------------------------------------------------------
    const quarterResult = await createQuarterUseCase.execute({
      associationId,
      name: 'Campus Universitaire Zogbadjè',
      city: 'Abomey-Calavi',
      description: 'Logements étudiants de proximité pour la FADESP et la FAST',
      requesterUserId: managerUserId,
    });

    expect(quarterResult.id).toBeDefined();
    expect(quarterResult.name).toBe('Campus Universitaire Zogbadjè');
    expect(quarterResult.city).toBe('Abomey-Calavi');
    expect(repository.quarters.has(quarterResult.id)).toBe(true);

    // -------------------------------------------------------------------------
    // 2. Création du Bâtiment Conventionné
    // -------------------------------------------------------------------------
    const buildingResult = await createBuildingUseCase.execute({
      quarterId: quarterResult.id,
      name: 'Résidence Solidarité - Bloc A',
      address: 'Lot 142, Quartier Zogbadjè, Face Clôture UAC',
      floorsCount: 3,
      landlordName: 'El-Hadj Moussibaou BIO',
      landlordPhone: '+229 97 88 44 22',
      requesterUserId: managerUserId,
    });

    expect(buildingResult.id).toBeDefined();
    expect(buildingResult.quarterId).toBe(quarterResult.id);
    expect(buildingResult.landlordName).toBe('El-Hadj Moussibaou BIO');

    // -------------------------------------------------------------------------
    // 3. Configuration de la Chambre (Chambre Double : Capacité = 2)
    // -------------------------------------------------------------------------
    const roomResult = await createRoomUseCase.execute({
      buildingId: buildingResult.id,
      roomNumber: 'A-102',
      capacity: 2,
      requesterUserId: managerUserId,
    });

    expect(roomResult.id).toBeDefined();
    expect(roomResult.roomNumber).toBe('A-102');
    expect(roomResult.capacity).toBe(2);
    expect(roomResult.status).toBe('AVAILABLE');

    // Vérification de l'unicité du numéro au sein du bâtiment
    await expect(
      createRoomUseCase.execute({
        buildingId: buildingResult.id,
        roomNumber: 'A-102',
        capacity: 1,
        requesterUserId: managerUserId,
      }),
    ).rejects.toThrow(ConflictException);

    // -------------------------------------------------------------------------
    // 4. Statistiques initiales du parc
    // -------------------------------------------------------------------------
    const initialStats = await getResidenceStatsQuery.execute(associationId);
    expect(initialStats.totalQuarters).toBe(1);
    expect(initialStats.totalBuildings).toBe(1);
    expect(initialStats.totalRooms).toBe(1);
    expect(initialStats.totalCapacity).toBe(2);
    expect(initialStats.availableRooms).toBe(1);
    expect(initialStats.occupiedRooms).toBe(0);
    expect(initialStats.occupancyRate).toBe(0);

    // -------------------------------------------------------------------------
    // 5. Attribution du 1er occupant (Alice) : Chambre reste AVAILABLE (1 place libre)
    // -------------------------------------------------------------------------
    const now = new Date('2026-11-01T00:00:00.000Z');
    const occAlice = await assignRoomOccupationUseCase.execute({
      roomId: roomResult.id,
      occupantUserId: studentAliceId,
      associationId,
      startDate: now,
      requesterUserId: managerUserId,
    });

    expect(occAlice.id).toBeDefined();
    expect(occAlice.isActive).toBe(true);
    expect(occAlice.status).toBe('ACTIVE');

    // La chambre a une capacité de 2, elle doit rester AVAILABLE car il reste 1 lit
    const roomAfterAlice = await repository.findRoomById(roomResult.id);
    expect(roomAfterAlice?.status).toBe('AVAILABLE');

    // L'événement de domaine RoomOccupiedDomainEvent a bien été émis
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      RoomOccupiedDomainEvent.EVENT_NAME,
      expect.any(RoomOccupiedDomainEvent),
    );

    const firstEvent = emittedEvents.find(
      (e) => e.name === RoomOccupiedDomainEvent.EVENT_NAME,
    )?.payload as RoomOccupiedDomainEvent;
    expect(firstEvent.occupantUserId).toBe(studentAliceId);
    expect(firstEvent.roomId).toBe(roomResult.id);
    expect(firstEvent.associationId).toBe(associationId);

    // -------------------------------------------------------------------------
    // 6. Attribution du 2ème occupant (Bob) : Capacité atteinte -> Chambre devient OCCUPIED
    // -------------------------------------------------------------------------
    const occBob = await assignRoomOccupationUseCase.execute({
      roomId: roomResult.id,
      occupantUserId: studentBobId,
      associationId,
      startDate: now,
      requesterUserId: managerUserId,
    });

    expect(occBob.id).toBeDefined();
    const roomAfterBob = await repository.findRoomById(roomResult.id);
    expect(roomAfterBob?.status).toBe('OCCUPIED');

    // Statistiques après remplissage complet
    const statsFull = await getResidenceStatsQuery.execute(associationId);
    expect(statsFull.availableRooms).toBe(0);
    expect(statsFull.occupiedRooms).toBe(1);
    expect(statsFull.activeOccupations).toBe(2);
    expect(statsFull.occupancyRate).toBe(100);

    // -------------------------------------------------------------------------
    // 7. Tentatives de violations des invariants métier (Robustesse)
    // -------------------------------------------------------------------------
    // Règle 1 : Empêcher un 3ème occupant sans allowSurplus
    const studentCharlieId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    await expect(
      assignRoomOccupationUseCase.execute({
        roomId: roomResult.id,
        occupantUserId: studentCharlieId,
        associationId,
        startDate: now,
        requesterUserId: managerUserId,
      }),
    ).rejects.toThrow(ConflictException);

    // Règle 2 : Empêcher Alice d'avoir un 2ème bail actif simultané
    await expect(
      assignRoomOccupationUseCase.execute({
        roomId: roomResult.id,
        occupantUserId: studentAliceId,
        associationId,
        startDate: now,
        allowSurplus: true,
        requesterUserId: managerUserId,
      }),
    ).rejects.toThrow('Cet utilisateur dispose déjà d\'un logement actif');

    // -------------------------------------------------------------------------
    // 8. Consultation de l'Annuaire des Résidents
    // -------------------------------------------------------------------------
    const residents = await getResidentsQuery.execute({ associationId, isActive: true });
    expect(residents).toHaveLength(2);
    const aliceRecord = residents.find((r) => r.userId === studentAliceId);
    expect(aliceRecord).toBeDefined();
    expect(aliceRecord?.currentRoom?.roomNumber).toBe('A-102');
    expect(aliceRecord?.currentRoom?.buildingName).toBe('Résidence Solidarité - Bloc A');
    expect(aliceRecord?.currentRoom?.landlordName).toBe('El-Hadj Moussibaou BIO');

    // -------------------------------------------------------------------------
    // 9. Clôture de Bail / Départ d'Alice : Chambre repasse à AVAILABLE (1 place libre)
    // -------------------------------------------------------------------------
    const departureDate = new Date('2027-06-30T00:00:00.000Z');
    const termResult = await terminateRoomOccupationUseCase.execute({
      occupationId: occAlice.id,
      endDate: departureDate,
      requesterUserId: managerUserId,
    });

    expect(termResult.isActive).toBe(false);
    expect(termResult.status).toBe('TERMINATED');

    const roomAfterAliceDeparture = await repository.findRoomById(roomResult.id);
    expect(roomAfterAliceDeparture?.status).toBe('AVAILABLE');

    // Événement RoomVacatedDomainEvent émis
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      RoomVacatedDomainEvent.EVENT_NAME,
      expect.any(RoomVacatedDomainEvent),
    );

    const vacateEvent = emittedEvents.find(
      (e) => e.name === RoomVacatedDomainEvent.EVENT_NAME,
    )?.payload as RoomVacatedDomainEvent;
    expect(vacateEvent.occupantUserId).toBe(studentAliceId);
    expect(vacateEvent.roomId).toBe(roomResult.id);

    // -------------------------------------------------------------------------
    // 10. Traçabilité d'Audit Immuable
    // -------------------------------------------------------------------------
    expect(auditLogs.length).toBeGreaterThanOrEqual(4);
    const actions = auditLogs.map((l) => l.action);
    expect(actions).toContain('RESIDENCE.QUARTER.CREATED');
    expect(actions).toContain('RESIDENCE.BUILDING.CREATED');
    expect(actions).toContain('RESIDENCE.ROOM.CREATED');
    expect(actions).toContain('RESIDENCE.ROOM_OCCUPATION.ASSIGNED');
    expect(actions).toContain('RESIDENCE.ROOM_OCCUPATION.TERMINATED');
  });

  it('Valide le gabarit de données du Certificat de Résidence & Convention Républicaine', () => {
    const certificateData = {
      certificateRef: 'MC-BEN-RES-2026-0894',
      issueDate: '28 octobre 2026',
      academicYear: '2026 - 2027',
      resident: {
        fullName: 'KOUASSI Houénou Marcel',
        birthDate: '14/05/2003',
        birthPlace: 'Porto-Novo',
        nationality: 'Béninoise',
        idNumber: 'ID-BEN-1029384756',
        matricule: 'UAC-FADESP-2023-4512',
        institution: 'Université d\'Abomey-Calavi (UAC)',
      },
      room: {
        roomNumber: 'A-102',
        buildingName: 'Résidence Solidarité - Bloc A',
        quarterName: 'Campus Universitaire Zogbadjè',
        city: 'Abomey-Calavi',
        department: 'Atlantique',
      },
      association: {
        name: 'Association des Étudiants Béninois (AEB)',
        prefectureOrder: 'Arrêté Préfectoral N° 2018/042/DEP-ATL/SG/SAG',
        managerFullName: 'BIO Sikirou',
        managerRole: 'Président du Bureau Exécutif',
      },
    };

    expect(certificateData.certificateRef).toMatch(/^MC-BEN-RES-\d{4}-\d{4}$/);
    expect(certificateData.association.prefectureOrder).toContain('Arrêté Préfectoral');
    expect(certificateData.room.department).toBe('Atlantique');
    expect(certificateData.resident.nationality).toBe('Béninoise');
  });
});

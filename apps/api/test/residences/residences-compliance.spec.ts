import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { QuarterEntity } from '../../src/modules/residences/domain/entities/quarter.entity.js';
import { BuildingEntity } from '../../src/modules/residences/domain/entities/building.entity.js';
import { RoomEntity } from '../../src/modules/residences/domain/entities/room.entity.js';
import { RoomOccupationEntity } from '../../src/modules/residences/domain/entities/room-occupation.entity.js';
import { RoomOccupiedDomainEvent } from '../../src/modules/residences/domain/events/room-occupied.domain-event.js';
import { RoomVacatedDomainEvent } from '../../src/modules/residences/domain/events/room-vacated.domain-event.js';

import { CreateQuarterUseCase } from '../../src/modules/residences/application/commands/create-quarter.use-case.js';
import { UpdateQuarterUseCase } from '../../src/modules/residences/application/commands/update-quarter.use-case.js';
import { DeleteQuarterUseCase } from '../../src/modules/residences/application/commands/delete-quarter.use-case.js';

import { CreateBuildingUseCase } from '../../src/modules/residences/application/commands/create-building.use-case.js';
import { UpdateBuildingUseCase } from '../../src/modules/residences/application/commands/update-building.use-case.js';

import { CreateRoomUseCase } from '../../src/modules/residences/application/commands/create-room.use-case.js';
import { UpdateRoomStatusUseCase } from '../../src/modules/residences/application/commands/update-room-status.use-case.js';

import { AssignRoomOccupationUseCase } from '../../src/modules/residences/application/commands/assign-room-occupation.use-case.js';
import { TerminateRoomOccupationUseCase } from '../../src/modules/residences/application/commands/terminate-room-occupation.use-case.js';

import { ListQuartersQuery } from '../../src/modules/residences/application/queries/list-quarters.query.js';
import { ListBuildingsQuery } from '../../src/modules/residences/application/queries/list-buildings.query.js';
import { ListRoomsQuery } from '../../src/modules/residences/application/queries/list-rooms.query.js';
import { ListOccupationsQuery } from '../../src/modules/residences/application/queries/list-occupations.query.js';
import { GetResidenceStatsQuery } from '../../src/modules/residences/application/queries/get-residence-stats.query.js';


import type {
  ResidenceReaderPort,
  ListOccupationsFilter,
  ResidenceStats,
  ResidentSummary,
} from '../../src/modules/residences/application/ports/residence-reader.port.js';
import type { ResidenceWriterPort } from '../../src/modules/residences/application/ports/residence-writer.port.js';
import { ResidenceMapper } from '../../src/modules/residences/infrastructure/mappers/residence.mapper.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

class InMemoryResidenceRepository
  implements ResidenceReaderPort, ResidenceWriterPort
{
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

  async findOccupationById(id: string): Promise<RoomOccupationEntity | null> {
    return this.occupations.get(id) ?? null;
  }

  async findActiveOccupationsByRoom(roomId: string): Promise<RoomOccupationEntity[]> {
    return Array.from(this.occupations.values()).filter(
      (o) => o.roomId === roomId && o.isActive,
    );
  }

  async findActiveOccupationByUser(userId: string): Promise<RoomOccupationEntity | null> {
    for (const o of this.occupations.values()) {
      if (o.occupantUserId === userId && o.isActive) {
        return o;
      }
    }
    return null;
  }

  async listOccupations(filter?: ListOccupationsFilter): Promise<RoomOccupationEntity[]> {
    let list = Array.from(this.occupations.values());
    if (filter?.associationId) {
      list = list.filter((o) => o.associationId === filter.associationId);
    }
    if (filter?.roomId) {
      list = list.filter((o) => o.roomId === filter.roomId);
    }
    if (filter?.occupantUserId) {
      list = list.filter((o) => o.occupantUserId === filter.occupantUserId);
    }
    if (filter?.isActive !== undefined) {
      list = list.filter((o) => o.isActive === filter.isActive);
    }
    return list;
  }

  async countBuildingsByQuarter(quarterId: string): Promise<number> {
    return Array.from(this.buildings.values()).filter((b) => b.quarterId === quarterId).length;
  }

  async countRoomsByBuilding(buildingId: string): Promise<number> {
    return Array.from(this.rooms.values()).filter((r) => r.buildingId === buildingId).length;
  }

  async getStats(associationId?: string): Promise<ResidenceStats> {
    const quarters = Array.from(this.quarters.values()).filter((q) =>
      associationId ? q.associationId === associationId : true,
    );
    const quarterIds = new Set(quarters.map((q) => q.id));
    const buildings = Array.from(this.buildings.values()).filter((b) =>
      quarterIds.has(b.quarterId),
    );
    const buildingIds = new Set(buildings.map((b) => b.id));
    const rooms = Array.from(this.rooms.values()).filter((r) =>
      buildingIds.has(r.buildingId),
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
          firstName: 'Résident',
          lastName: 'Test',
          phoneNumber: '+229 97 00 00 00',
          email: 'test@mycommunity.bj',
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
        associationName: 'AJAC',
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


describe('Module Residences — Conformité SOLID & ADR-010', () => {
  let repository: InMemoryResidenceRepository;
  let auditLoggerMock: { log: ReturnType<typeof vi.fn> };
  let eventEmitterMock: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repository = new InMemoryResidenceRepository();
    auditLoggerMock = { log: vi.fn().mockResolvedValue(undefined) };
    eventEmitterMock = { emit: vi.fn() };
  });

  describe('1. Quartiers (Quarters)', () => {
    it('devrait créer un quartier avec succès et enregistrer une trace audit', async () => {
      const useCase = new CreateQuarterUseCase(repository, auditLoggerMock as any);
      const associationId = randomUUID();
      const requesterUserId = randomUUID();

      const result = await useCase.execute({
        associationId,
        name: 'Campus Abomey-Calavi',
        city: 'Abomey-Calavi',
        description: 'Foyer principal',
        requesterUserId,
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Campus Abomey-Calavi');
      expect(result.city).toBe('Abomey-Calavi');
      expect(repository.quarters.has(result.id)).toBe(true);

      expect(auditLoggerMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'RESIDENCE.QUARTER.CREATED',
          resourceType: 'quarter',
          resourceId: result.id,
        }),
      );
    });

    it('devrait rejeter un quartier avec un nom trop court', () => {
      expect(() =>
        QuarterEntity.create({
          associationId: randomUUID(),
          name: 'A',
          city: 'Cotonou',
        }),
      ).toThrow("Le nom du quartier doit comporter au moins 2 caractères.");
    });
  });

  describe('2. Bâtiments (Buildings)', () => {
    it('devrait créer un bâtiment rattaché à un quartier existant', async () => {
      const quarter = QuarterEntity.create({
        associationId: randomUUID(),
        name: 'Campus Zogbadjè',
        city: 'Abomey-Calavi',
      });
      await repository.saveQuarter(quarter);

      const useCase = new CreateBuildingUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      const result = await useCase.execute({
        quarterId: quarter.id,
        name: 'Villa Espoir',
        address: 'Rue 12, Lot 4',
        landlordName: 'M. Mensah',
        landlordPhone: '+22997112233',
        floorsCount: 2,
        requesterUserId: randomUUID(),
      });

      expect(result.id).toBeDefined();
      expect(result.floorsCount).toBe(2);
      expect(repository.buildings.has(result.id)).toBe(true);
    });

    it('devrait rejeter un bâtiment rattaché à un quartier inexistant', async () => {
      const useCase = new CreateBuildingUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      await expect(
        useCase.execute({
          quarterId: randomUUID(),
          name: 'Villa Invalide',
          address: 'Rue X',
          landlordName: 'Bailleur',
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. Chambres (Rooms)', () => {
    it('devrait créer une chambre dans un bâtiment avec capacité strictement positive', async () => {
      const building = BuildingEntity.create({
        quarterId: randomUUID(),
        name: 'Bâtiment B',
        address: 'Adresse',
        landlordName: 'Bailleur B',
      });
      await repository.saveBuilding(building);

      const useCase = new CreateRoomUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      const result = await useCase.execute({
        buildingId: building.id,
        roomNumber: 'B-101',
        capacity: 2,
        requesterUserId: randomUUID(),
      });

      expect(result.roomNumber).toBe('B-101');
      expect(result.capacity).toBe(2);
      expect(result.status).toBe('AVAILABLE');
      expect(repository.rooms.has(result.id)).toBe(true);
    });

    it('devrait interdire deux chambres avec le même numéro dans le même bâtiment', async () => {
      const building = BuildingEntity.create({
        quarterId: randomUUID(),
        name: 'Bâtiment B',
        address: 'Adresse',
        landlordName: 'Bailleur B',
      });
      await repository.saveBuilding(building);

      const room = RoomEntity.create({
        buildingId: building.id,
        roomNumber: 'B-101',
        capacity: 1,
      });
      await repository.saveRoom(room);

      const useCase = new CreateRoomUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      await expect(
        useCase.execute({
          buildingId: building.id,
          roomNumber: 'B-101',
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('4. Occupations de Chambres (ADR-010)', () => {
    it('devrait attribuer une chambre, émettre un événement de domaine et mettre à jour le statut', async () => {
      const buildingId = randomUUID();
      const associationId = randomUUID();
      const occupantUserId = randomUUID();

      const room = RoomEntity.create({
        buildingId,
        roomNumber: 'CH-SINGLE',
        capacity: 1,
      });
      await repository.saveRoom(room);

      const useCase = new AssignRoomOccupationUseCase(
        repository,
        repository,
        auditLoggerMock as any,
        eventEmitterMock as unknown as EventEmitter2,
      );

      const startDate = new Date('2026-11-01');
      const result = await useCase.execute({
        roomId: room.id,
        occupantUserId,
        associationId,
        startDate,
        requesterUserId: randomUUID(),
      });

      expect(result.id).toBeDefined();
      expect(result.isActive).toBe(true);
      expect(result.status).toBe('ACTIVE');

      // Capacité de 1 atteinte => La chambre doit passer en OCCUPIED
      const updatedRoom = await repository.findRoomById(room.id);
      expect(updatedRoom?.status).toBe('OCCUPIED');

      // Émission d'événement de domaine pour le module finance (facturation frais d'intégration)
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        RoomOccupiedDomainEvent.EVENT_NAME,
        expect.objectContaining({
          occupationId: result.id,
          roomId: room.id,
          occupantUserId,
          associationId,
          startDate,
        }),
      );
    });

    it('devrait rejeter l’attribution si la capacité maximale de la chambre est atteinte', async () => {
      const room = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-FULL',
        capacity: 1,
      });
      await repository.saveRoom(room);

      const existingOccupation = RoomOccupationEntity.create({
        roomId: room.id,
        occupantUserId: randomUUID(),
        associationId: randomUUID(),
        startDate: new Date('2026-10-01'),
        isActive: true,
      });
      await repository.saveOccupation(existingOccupation);

      const useCase = new AssignRoomOccupationUseCase(
        repository,
        repository,
        auditLoggerMock as any,
        eventEmitterMock as unknown as EventEmitter2,
      );

      await expect(
        useCase.execute({
          roomId: room.id,
          occupantUserId: randomUUID(),
          associationId: randomUUID(),
          startDate: new Date('2026-11-01'),
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait accepter un surplus d’occupants en cas de besoin pour une chambre de 4 personnes (allowSurplus: true)', async () => {
      const room = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-QUAD-SURPLUS',
        capacity: 4,
      });
      await repository.saveRoom(room);

      const associationId = randomUUID();

      // 4 occupants initiaux
      for (let i = 0; i < 4; i++) {
        await repository.saveOccupation(
          RoomOccupationEntity.create({
            roomId: room.id,
            occupantUserId: randomUUID(),
            associationId,
            startDate: new Date('2026-10-01'),
            isActive: true,
          }),
        );
      }

      const useCase = new AssignRoomOccupationUseCase(
        repository,
        repository,
        auditLoggerMock as any,
        eventEmitterMock as unknown as EventEmitter2,
      );

      // 5ème occupant admis grâce au surplus solidaire en cas de besoin
      const surplusResult = await useCase.execute({
        roomId: room.id,
        occupantUserId: randomUUID(),
        associationId,
        startDate: new Date('2026-11-01'),
        requesterUserId: randomUUID(),
        allowSurplus: true,
        surplusReason: "Accueil d'urgence étudiant en période de rentrée",
      });

      expect(surplusResult.id).toBeDefined();
      expect(surplusResult.isActive).toBe(true);
      expect(surplusResult.status).toBe('ACTIVE');

      const occupations = await repository.findActiveOccupationsByRoom(room.id);
      expect(occupations.length).toBe(5);
    });

    it('devrait interdire d’avoir deux chambres actives pour le même utilisateur (ADR-010)', async () => {
      const occupantUserId = randomUUID();
      const associationId = randomUUID();

      const room1 = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-1',
        capacity: 2,
      });
      const room2 = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-2',
        capacity: 2,
      });
      await repository.saveRoom(room1);
      await repository.saveRoom(room2);

      const existingOccupation = RoomOccupationEntity.create({
        roomId: room1.id,
        occupantUserId,
        associationId,
        startDate: new Date('2026-10-01'),
        isActive: true,
      });
      await repository.saveOccupation(existingOccupation);

      const useCase = new AssignRoomOccupationUseCase(
        repository,
        repository,
        auditLoggerMock as any,
        eventEmitterMock as unknown as EventEmitter2,
      );

      await expect(
        useCase.execute({
          roomId: room2.id,
          occupantUserId,
          associationId,
          startDate: new Date('2026-11-01'),
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait résilier une occupation de chambre et remettre la chambre en AVAILABLE', async () => {
      const room = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-RELEASE',
        capacity: 1,
      });
      room.markOccupied();
      await repository.saveRoom(room);

      const occupation = RoomOccupationEntity.create({
        roomId: room.id,
        occupantUserId: randomUUID(),
        associationId: randomUUID(),
        startDate: new Date('2026-10-01'),
        isActive: true,
      });
      await repository.saveOccupation(occupation);

      const useCase = new TerminateRoomOccupationUseCase(
        repository,
        repository,
        auditLoggerMock as any,
        eventEmitterMock as unknown as EventEmitter2,
      );

      const endDate = new Date('2026-10-31');
      const result = await useCase.execute({
        occupationId: occupation.id,
        endDate,
        requesterUserId: randomUUID(),
      });

      expect(result.isActive).toBe(false);
      expect(result.status).toBe('TERMINATED');
      expect(result.endDate).toEqual(endDate);

      // La chambre doit redevenir AVAILABLE
      const updatedRoom = await repository.findRoomById(room.id);
      expect(updatedRoom?.status).toBe('AVAILABLE');

      // Émission de l'événement RoomVacatedDomainEvent
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        RoomVacatedDomainEvent.EVENT_NAME,
        expect.objectContaining({
          occupationId: occupation.id,
          roomId: room.id,
          endDate,
        }),
      );
    });
  });

  describe('5. Requêtes de Consultation (Queries)', () => {
    it('devrait filtrer les occupations par associationId et statut actif', async () => {
      const assoc1 = randomUUID();
      const assoc2 = randomUUID();

      const occ1 = RoomOccupationEntity.create({
        roomId: randomUUID(),
        occupantUserId: randomUUID(),
        associationId: assoc1,
        startDate: new Date('2026-09-01'),
        isActive: true,
      });
      const occ2 = RoomOccupationEntity.create({
        roomId: randomUUID(),
        occupantUserId: randomUUID(),
        associationId: assoc1,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-10-01'),
        isActive: false,
        status: 'TERMINATED',
      });
      const occ3 = RoomOccupationEntity.create({
        roomId: randomUUID(),
        occupantUserId: randomUUID(),
        associationId: assoc2,
        startDate: new Date('2026-09-01'),
        isActive: true,
      });

      await repository.saveOccupation(occ1);
      await repository.saveOccupation(occ2);
      await repository.saveOccupation(occ3);

      const query = new ListOccupationsQuery(repository);

      const activeAssoc1 = await query.execute({
        associationId: assoc1,
        isActive: true,
      });
      expect(activeAssoc1).toHaveLength(1);
      expect(activeAssoc1[0]?.id).toBe(occ1.id);

      const allAssoc1 = await query.execute({ associationId: assoc1 });
      expect(allAssoc1).toHaveLength(2);
    });

    it('devrait lister les quartiers d’une association', async () => {
      const associationId = randomUUID();
      const q1 = QuarterEntity.create({
        associationId,
        name: 'Quartier 1',
        city: 'Cotonou',
      });
      const q2 = QuarterEntity.create({
        associationId: randomUUID(),
        name: 'Quartier Autre',
        city: 'Porto-Novo',
      });

      await repository.saveQuarter(q1);
      await repository.saveQuarter(q2);

      const query = new ListQuartersQuery(repository);
      const results = await query.execute(associationId);

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Quartier 1');
    });

    it('devrait lister les bâtiments d’un quartier', async () => {
      const quarterId = randomUUID();
      const b1 = BuildingEntity.create({
        quarterId,
        name: 'Pavillon 1',
        address: 'Rue 1',
        landlordName: 'Bailleur 1',
      });
      const b2 = BuildingEntity.create({
        quarterId: randomUUID(),
        name: 'Autre Pavillon',
        address: 'Rue 2',
        landlordName: 'Bailleur 2',
      });

      await repository.saveBuilding(b1);
      await repository.saveBuilding(b2);

      const query = new ListBuildingsQuery(repository);
      const results = await query.execute(quarterId);

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Pavillon 1');
    });

    it('devrait lister les chambres d’un bâtiment', async () => {
      const buildingId = randomUUID();
      const r1 = RoomEntity.create({
        buildingId,
        roomNumber: 'CH-A',
        capacity: 1,
      });
      const r2 = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-B',
        capacity: 1,
      });

      await repository.saveRoom(r1);
      await repository.saveRoom(r2);

      const query = new ListRoomsQuery(repository);
      const results = await query.execute(buildingId);

      expect(results).toHaveLength(1);
      expect(results[0]?.roomNumber).toBe('CH-A');
    });
  });

  describe('6. Mappers (Data Mapper Pattern)', () => {
    it('devrait convertir fidèlement un enregistrement Prisma Room en entité RoomEntity', () => {
      const now = new Date();
      const prismaRoom = {
        id: randomUUID(),
        buildingId: randomUUID(),
        roomNumber: 'CH-301',
        capacity: 3,
        status: 'AVAILABLE' as const,
        createdAt: now,
        updatedAt: now,
      };

      const entity = ResidenceMapper.toRoomEntity(prismaRoom);
      expect(entity.id).toBe(prismaRoom.id);
      expect(entity.roomNumber).toBe('CH-301');
      expect(entity.capacity).toBe(3);
      expect(entity.status).toBe('AVAILABLE');
    });

    it('devrait convertir fidèlement un enregistrement Prisma RoomOccupation en entité RoomOccupationEntity', () => {
      const now = new Date();
      const prismaOccupation = {
        id: randomUUID(),
        roomId: randomUUID(),
        occupantUserId: randomUUID(),
        associationId: randomUUID(),
        startDate: new Date('2026-11-01'),
        endDate: null,
        isActive: true,
        status: 'ACTIVE' as const,
        createdAt: now,
        updatedAt: now,
      };

      const entity = ResidenceMapper.toOccupationEntity(prismaOccupation);
      expect(entity.id).toBe(prismaOccupation.id);
      expect(entity.roomId).toBe(prismaOccupation.roomId);
      expect(entity.isActive).toBe(true);
      expect(entity.status).toBe('ACTIVE');
    });
  });

  describe('Cycle de Vie CRUD Complet — Update, Delete & Statistiques', () => {
    it('devrait mettre à jour les informations d’un quartier et auditer l’action', async () => {
      const quarter = QuarterEntity.create({
        associationId: randomUUID(),
        name: 'Campus Ouest',
        city: 'Cotonou',
      });
      await repository.saveQuarter(quarter);

      const updateQuarterUseCase = new UpdateQuarterUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      const result = await updateQuarterUseCase.execute({
        quarterId: quarter.id,
        name: 'Campus Ouest Rénové',
        city: 'Ouidah',
        requesterUserId: randomUUID(),
      });

      expect(result.name).toBe('Campus Ouest Rénové');
      expect(result.city).toBe('Ouidah');
      expect(auditLoggerMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESIDENCE.QUARTER.UPDATED' }),
      );
    });

    it('devrait empêcher la suppression d’un quartier s’il contient des bâtiments', async () => {
      const quarter = QuarterEntity.create({
        associationId: randomUUID(),
        name: 'Campus Nord',
        city: 'Parakou',
      });
      await repository.saveQuarter(quarter);

      const building = BuildingEntity.create({
        quarterId: quarter.id,
        name: 'Bâtiment Alpha',
        address: 'Rue 1',
        landlordName: 'M. Touré',
      });
      await repository.saveBuilding(building);

      const deleteQuarterUseCase = new DeleteQuarterUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      await expect(
        deleteQuarterUseCase.execute({
          quarterId: quarter.id,
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow('Impossible de supprimer le quartier');
    });

    it('devrait mettre à jour les coordonnées du propriétaire d’un bâtiment', async () => {
      const building = BuildingEntity.create({
        quarterId: randomUUID(),
        name: 'Bâtiment Beta',
        address: 'Rue 2',
        landlordName: 'Propriétaire Initial',
        landlordPhone: '+229 97 00 00 01',
      });
      await repository.saveBuilding(building);

      const updateBuildingUseCase = new UpdateBuildingUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      const result = await updateBuildingUseCase.execute({
        buildingId: building.id,
        landlordName: 'Nouveau Propriétaire',
        landlordPhone: '+229 97 99 99 99',
        requesterUserId: randomUUID(),
      });

      expect(result.landlordName).toBe('Nouveau Propriétaire');
      expect(result.landlordPhone).toBe('+229 97 99 99 99');
    });

    it('devrait empêcher la mise en maintenance d’une chambre occupée et permettre le passage lorsque vide', async () => {
      const room = RoomEntity.create({
        buildingId: randomUUID(),
        roomNumber: 'CH-MAINT-1',
        capacity: 1,
      });
      await repository.saveRoom(room);

      const occupation = RoomOccupationEntity.create({
        roomId: room.id,
        occupantUserId: randomUUID(),
        associationId: randomUUID(),
        startDate: new Date('2026-10-01'),
        isActive: true,
      });
      await repository.saveOccupation(occupation);

      const updateStatusUseCase = new UpdateRoomStatusUseCase(
        repository,
        repository,
        auditLoggerMock as any,
      );

      // Échec car chambre occupée
      await expect(
        updateStatusUseCase.execute({
          roomId: room.id,
          status: 'MAINTENANCE',
          requesterUserId: randomUUID(),
        }),
      ).rejects.toThrow('Impossible de passer la chambre en maintenance car elle est actuellement occupée');

      // Clôture du bail
      occupation.terminate();
      await repository.saveOccupation(occupation);

      // Succès maintenant que la chambre est libre
      const updated = await updateStatusUseCase.execute({
        roomId: room.id,
        status: 'MAINTENANCE',
        requesterUserId: randomUUID(),
      });
      expect(updated.status).toBe('MAINTENANCE');
    });

    it('devrait calculer avec précision les statistiques globales du parc résidentiel', async () => {
      const assocId = randomUUID();
      const quarter = QuarterEntity.create({
        associationId: assocId,
        name: 'Campus Stats',
        city: 'Calavi',
      });
      await repository.saveQuarter(quarter);

      const building = BuildingEntity.create({
        quarterId: quarter.id,
        name: 'Bâtiment Stats',
        address: 'Allée centrale',
        landlordName: 'Bailleur',
      });
      await repository.saveBuilding(building);

      const room1 = RoomEntity.create({
        buildingId: building.id,
        roomNumber: 'R-1',
        capacity: 2,
        status: 'OCCUPIED',
      });
      const room2 = RoomEntity.create({
        buildingId: building.id,
        roomNumber: 'R-2',
        capacity: 1,
        status: 'AVAILABLE',
      });
      await repository.saveRoom(room1);
      await repository.saveRoom(room2);

      const query = new GetResidenceStatsQuery(repository);
      const stats = await query.execute(assocId);

      expect(stats.totalQuarters).toBe(1);
      expect(stats.totalBuildings).toBe(1);
      expect(stats.totalRooms).toBe(2);
      expect(stats.totalCapacity).toBe(3);
      expect(stats.occupiedRooms).toBe(1);
      expect(stats.availableRooms).toBe(1);
      expect(stats.occupancyRate).toBe(50);
    });

    it('devrait retourner la liste des résidents et le détail de leurs différents contrats', async () => {
      const assocId = randomUUID();
      const userId = randomUUID();
      const quarter = QuarterEntity.create({
        associationId: assocId,
        name: 'Campus Calavi',
        city: 'Abomey-Calavi',
      });
      const building = BuildingEntity.create({
        quarterId: quarter.id,
        name: 'Pavillon Zogbadjè',
        address: 'Rue 12',
        landlordName: 'Jean Bio',
        landlordPhone: '+229 97 11 22 33',
        floorsCount: 3,
      });
      const room = RoomEntity.create({
        buildingId: building.id,
        roomNumber: '101',
        capacity: 1,
        status: 'OCCUPIED',
      });
      const occupation = RoomOccupationEntity.create({
        roomId: room.id,
        occupantUserId: userId,
        associationId: assocId,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        status: 'ACTIVE',
      });

      await repository.saveQuarter(quarter);
      await repository.saveBuilding(building);
      await repository.saveRoom(room);
      await repository.saveOccupation(occupation);

      const residents = await repository.listResidents();
      expect(residents).toHaveLength(1);
      const resident = residents[0];
      expect(resident.userId).toBe(userId);
      expect(resident.isActiveResident).toBe(true);
      expect(resident.currentRoom?.roomNumber).toBe('101');
      expect(resident.currentRoom?.buildingName).toBe('Pavillon Zogbadjè');
      expect(resident.contractsCount).toBe(1);
      expect(resident.contracts[0].id).toBe(occupation.id);

      const found = await repository.findResidentById(userId);
      expect(found).not.toBeNull();
      expect(found?.userId).toBe(userId);
    });
  });
});



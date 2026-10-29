import { Injectable } from '@nestjs/common';
import type {
  Quarter as PrismaQuarter,
  Building as PrismaBuilding,
  Room as PrismaRoom,
  RoomOccupation as PrismaRoomOccupation,
} from '@prisma/client';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import type { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import type { BuildingEntity } from '../../domain/entities/building.entity.js';
import type { RoomEntity } from '../../domain/entities/room.entity.js';
import type { RoomOccupationEntity } from '../../domain/entities/room-occupation.entity.js';
import type {
  ResidenceReaderPort,
  ListOccupationsFilter,
  ResidenceStats,
  ResidentSummary,
  ResidentContractSummary,
} from '../../application/ports/residence-reader.port.js';
import type { ResidenceWriterPort } from '../../application/ports/residence-writer.port.js';
import { ResidenceMapper } from '../mappers/residence.mapper.js';

@Injectable()
export class PrismaResidenceRepository
  implements ResidenceReaderPort, ResidenceWriterPort
{
  constructor(private readonly prisma: PrismaService) {}

  public async findQuarterById(id: string): Promise<QuarterEntity | null> {
    const raw = await this.prisma.quarter.findUnique({ where: { id } });
    return raw ? ResidenceMapper.toQuarterEntity(raw) : null;
  }

  public async listQuartersByAssociation(associationId?: string): Promise<QuarterEntity[]> {
    const records = await this.prisma.quarter.findMany({
      where: associationId ? { associationId } : {},
      orderBy: { name: 'asc' },
    });
    return records.map((r: PrismaQuarter) => ResidenceMapper.toQuarterEntity(r));
  }

  public async findBuildingById(id: string): Promise<BuildingEntity | null> {
    const raw = await this.prisma.building.findUnique({ where: { id } });
    return raw ? ResidenceMapper.toBuildingEntity(raw) : null;
  }

  public async listBuildingsByQuarter(quarterId?: string): Promise<BuildingEntity[]> {
    const records = await this.prisma.building.findMany({
      where: quarterId ? { quarterId } : {},
      orderBy: { name: 'asc' },
    });
    return records.map((r: PrismaBuilding) => ResidenceMapper.toBuildingEntity(r));
  }

  public async findRoomById(id: string): Promise<RoomEntity | null> {
    const raw = await this.prisma.room.findUnique({ where: { id } });
    return raw ? ResidenceMapper.toRoomEntity(raw) : null;
  }

  public async findRoomByBuildingAndNumber(
    buildingId: string,
    roomNumber: string,
  ): Promise<RoomEntity | null> {
    const raw = await this.prisma.room.findUnique({
      where: {
        buildingId_roomNumber: {
          buildingId,
          roomNumber,
        },
      },
    });
    return raw ? ResidenceMapper.toRoomEntity(raw) : null;
  }

  public async listRoomsByBuilding(buildingId?: string): Promise<RoomEntity[]> {
    const records = await this.prisma.room.findMany({
      where: buildingId ? { buildingId } : {},
      orderBy: { roomNumber: 'asc' },
    });
    return records.map((r: PrismaRoom) => ResidenceMapper.toRoomEntity(r));
  }

  public async findOccupationById(id: string): Promise<RoomOccupationEntity | null> {
    const raw = await this.prisma.roomOccupation.findUnique({ where: { id } });
    return raw ? ResidenceMapper.toOccupationEntity(raw) : null;
  }

  public async findActiveOccupationsByRoom(roomId: string): Promise<RoomOccupationEntity[]> {
    const records = await this.prisma.roomOccupation.findMany({
      where: {
        roomId,
        isActive: true,
      },
    });
    return records.map((r: PrismaRoomOccupation) => ResidenceMapper.toOccupationEntity(r));
  }

  public async findActiveOccupationByUser(userId: string): Promise<RoomOccupationEntity | null> {
    const raw = await this.prisma.roomOccupation.findFirst({
      where: {
        occupantUserId: userId,
        isActive: true,
      },
    });
    return raw ? ResidenceMapper.toOccupationEntity(raw) : null;
  }

  public async listOccupations(
    filter?: ListOccupationsFilter,
  ): Promise<RoomOccupationEntity[]> {
    const whereClause: {
      associationId?: string;
      roomId?: string;
      occupantUserId?: string;
      isActive?: boolean;
    } = {};

    if (filter?.associationId) whereClause.associationId = filter.associationId;
    if (filter?.roomId) whereClause.roomId = filter.roomId;
    if (filter?.occupantUserId) whereClause.occupantUserId = filter.occupantUserId;
    if (filter?.isActive !== undefined) whereClause.isActive = filter.isActive;

    const records = await this.prisma.roomOccupation.findMany({
      where: whereClause,
      orderBy: { startDate: 'desc' },
    });

    return records.map((r: PrismaRoomOccupation) => ResidenceMapper.toOccupationEntity(r));
  }

  public async saveQuarter(quarter: QuarterEntity): Promise<void> {
    await this.prisma.quarter.upsert({
      where: { id: quarter.id },
      create: {
        id: quarter.id,
        associationId: quarter.associationId,
        name: quarter.name,
        city: quarter.city,
        description: quarter.description,
        createdAt: quarter.createdAt,
        updatedAt: quarter.updatedAt,
      },
      update: {
        name: quarter.name,
        city: quarter.city,
        description: quarter.description,
        updatedAt: quarter.updatedAt,
      },
    });
  }

  public async saveBuilding(building: BuildingEntity): Promise<void> {
    await this.prisma.building.upsert({
      where: { id: building.id },
      create: {
        id: building.id,
        quarterId: building.quarterId,
        name: building.name,
        address: building.address,
        landlordName: building.landlordName,
        landlordPhone: building.landlordPhone,
        landlordIbanOrMomo: building.landlordIbanOrMomo,
        floorsCount: building.floorsCount,
        createdAt: building.createdAt,
        updatedAt: building.updatedAt,
      },
      update: {
        name: building.name,
        address: building.address,
        landlordName: building.landlordName,
        landlordPhone: building.landlordPhone,
        landlordIbanOrMomo: building.landlordIbanOrMomo,
        floorsCount: building.floorsCount,
        updatedAt: building.updatedAt,
      },
    });
  }

  public async saveRoom(room: RoomEntity): Promise<void> {
    await this.prisma.room.upsert({
      where: { id: room.id },
      create: {
        id: room.id,
        buildingId: room.buildingId,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        status: room.status,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
      update: {
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        status: room.status,
        updatedAt: room.updatedAt,
      },
    });
  }

  public async saveOccupation(occupation: RoomOccupationEntity): Promise<void> {
    await this.prisma.roomOccupation.upsert({
      where: { id: occupation.id },
      create: {
        id: occupation.id,
        roomId: occupation.roomId,
        occupantUserId: occupation.occupantUserId,
        associationId: occupation.associationId,
        startDate: occupation.startDate,
        endDate: occupation.endDate,
        isActive: occupation.isActive,
        status: occupation.status,
        createdAt: occupation.createdAt,
        updatedAt: occupation.updatedAt,
      },
      update: {
        endDate: occupation.endDate,
        isActive: occupation.isActive,
        status: occupation.status,
        updatedAt: occupation.updatedAt,
      },
    });
  }

  public async countBuildingsByQuarter(quarterId: string): Promise<number> {
    return this.prisma.building.count({ where: { quarterId } });
  }

  public async countRoomsByBuilding(buildingId: string): Promise<number> {
    return this.prisma.room.count({ where: { buildingId } });
  }

  public async getStats(associationId?: string): Promise<ResidenceStats> {
    const quarterWhere = associationId ? { associationId } : {};
    const buildingWhere = associationId ? { quarter: { associationId } } : {};
    const roomWhere = associationId ? { building: { quarter: { associationId } } } : {};
    const occupationWhere = {
      isActive: true,
      ...(associationId ? { associationId } : {}),
    };

    const [totalQuarters, totalBuildings, rooms, activeOccupations] = await Promise.all([
      this.prisma.quarter.count({ where: quarterWhere }),
      this.prisma.building.count({ where: buildingWhere }),
      this.prisma.room.findMany({ where: roomWhere }),
      this.prisma.roomOccupation.count({ where: occupationWhere }),
    ]);

    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum: number, r: PrismaRoom) => sum + r.capacity, 0);
    const occupiedRooms = rooms.filter((r: PrismaRoom) => r.status === 'OCCUPIED').length;
    const availableRooms = rooms.filter((r: PrismaRoom) => r.status === 'AVAILABLE').length;
    const maintenanceRooms = rooms.filter((r: PrismaRoom) => r.status === 'MAINTENANCE').length;
    const occupancyRate =
      totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

    return {
      totalQuarters,
      totalBuildings,
      totalRooms,
      totalCapacity,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      activeOccupations,
      occupancyRate,
    };
  }

  public async deleteQuarter(id: string): Promise<void> {
    await this.prisma.quarter.delete({ where: { id } });
  }

  public async deleteBuilding(id: string): Promise<void> {
    await this.prisma.building.delete({ where: { id } });
  }

  public async deleteRoom(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }

  public async listResidents(filter?: {
    associationId?: string;
    isActive?: boolean;
  }): Promise<ResidentSummary[]> {
    const whereClause: {
      associationId?: string;
      isActive?: boolean;
    } = {};

    if (filter?.associationId) whereClause.associationId = filter.associationId;
    if (filter?.isActive !== undefined) whereClause.isActive = filter.isActive;

    const occupations = await this.prisma.roomOccupation.findMany({
      where: whereClause,
      include: {
        occupant: {
          include: {
            profile: true,
          },
        },
        room: {
          include: {
            building: {
              include: {
                quarter: true,
              },
            },
          },
        },
        association: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const map = new Map<string, ResidentSummary>();

    for (const occ of occupations) {
      const uId = occ.occupantUserId;
      let resident = map.get(uId);

      if (!resident) {
        const p = occ.occupant.profile;
        resident = {
          userId: uId,
          firstName: p?.firstName ?? 'Résident',
          lastName: p?.lastName ?? 'Citoyen',
          phoneNumber: occ.occupant.phoneNumber,
          email: occ.occupant.email,
          city: p?.city ?? occ.room.building.quarter.city,
          avatarKey: p?.avatarKey,
          isActiveResident: false,
          currentRoom: null,
          contractsCount: 0,
          contracts: [],
        };
        map.set(uId, resident);
      }

      resident.contractsCount += 1;
      const contract: ResidentContractSummary = {
        id: occ.id,
        roomId: occ.roomId,
        roomNumber: occ.room.roomNumber,
        buildingName: occ.room.building.name,
        quarterName: occ.room.building.quarter.name,
        quarterCity: occ.room.building.quarter.city,
        associationId: occ.associationId,
        associationName: occ.association?.name,
        startDate: occ.startDate,
        endDate: occ.endDate,
        isActive: occ.isActive,
        status: occ.status,
      };
      resident.contracts.push(contract);

      if (occ.isActive && !resident.currentRoom) {
        resident.isActiveResident = true;
        resident.currentRoom = {
          roomId: occ.roomId,
          roomNumber: occ.room.roomNumber,
          buildingName: occ.room.building.name,
          quarterName: occ.room.building.quarter.name,
          quarterCity: occ.room.building.quarter.city,
          landlordName: occ.room.building.landlordName,
          landlordPhone: occ.room.building.landlordPhone ?? undefined,
        };
      }
    }

    const list = Array.from(map.values());
    if (filter?.isActive !== undefined) {
      return list.filter((r) => r.isActiveResident === filter.isActive);
    }
    return list;
  }

  public async findResidentById(userId: string): Promise<ResidentSummary | null> {
    const list = await this.listResidents();
    const found = list.find((r) => r.userId === userId);
    return found ?? null;
  }
}


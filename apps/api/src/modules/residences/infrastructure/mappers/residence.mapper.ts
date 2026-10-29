import type {
  Quarter as PrismaQuarter,
  Building as PrismaBuilding,
  Room as PrismaRoom,
  RoomOccupation as PrismaRoomOccupation,
} from '@prisma/client';
import { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import { BuildingEntity } from '../../domain/entities/building.entity.js';
import { RoomEntity, type RoomStatusValue } from '../../domain/entities/room.entity.js';
import {
  RoomOccupationEntity,
  type OccupationStatusValue,
} from '../../domain/entities/room-occupation.entity.js';

export class ResidenceMapper {
  public static toQuarterEntity(raw: PrismaQuarter): QuarterEntity {
    return QuarterEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      name: raw.name,
      city: raw.city,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toBuildingEntity(raw: PrismaBuilding): BuildingEntity {
    return BuildingEntity.create({
      id: raw.id,
      quarterId: raw.quarterId,
      name: raw.name,
      address: raw.address,
      landlordName: raw.landlordName,
      landlordPhone: raw.landlordPhone,
      landlordIbanOrMomo: raw.landlordIbanOrMomo,
      floorsCount: raw.floorsCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toRoomEntity(raw: PrismaRoom): RoomEntity {
    return RoomEntity.create({
      id: raw.id,
      buildingId: raw.buildingId,
      roomNumber: raw.roomNumber,
      capacity: raw.capacity,
      status: raw.status as RoomStatusValue,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toOccupationEntity(raw: PrismaRoomOccupation): RoomOccupationEntity {
    return RoomOccupationEntity.create({
      id: raw.id,
      roomId: raw.roomId,
      occupantUserId: raw.occupantUserId,
      associationId: raw.associationId,
      startDate: raw.startDate,
      endDate: raw.endDate,
      isActive: raw.isActive,
      status: raw.status as OccupationStatusValue,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}

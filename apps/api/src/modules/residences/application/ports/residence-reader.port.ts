import type { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import type { BuildingEntity } from '../../domain/entities/building.entity.js';
import type { RoomEntity } from '../../domain/entities/room.entity.js';
import type { RoomOccupationEntity } from '../../domain/entities/room-occupation.entity.js';

export const RESIDENCE_READER_PORT = Symbol('RESIDENCE_READER_PORT');

export interface ListOccupationsFilter {
  associationId?: string;
  roomId?: string;
  occupantUserId?: string;
  isActive?: boolean;
}

export interface ResidenceStats {
  totalQuarters: number;
  totalBuildings: number;
  totalRooms: number;
  totalCapacity: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  activeOccupations: number;
  occupancyRate: number;
}

export interface ResidentContractSummary {
  id: string;
  roomId: string;
  roomNumber: string;
  buildingName: string;
  quarterName: string;
  quarterCity: string;
  associationId: string;
  associationName?: string;
  startDate: Date;
  endDate?: Date | null;
  isActive: boolean;
  status: string;
}

export interface ResidentSummary {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  city?: string | null;
  avatarKey?: string | null;
  isActiveResident: boolean;
  currentRoom?: {
    roomId: string;
    roomNumber: string;
    buildingName: string;
    quarterName: string;
    quarterCity: string;
    landlordName?: string;
    landlordPhone?: string;
  } | null;
  contractsCount: number;
  contracts: ResidentContractSummary[];
}

export interface ResidenceReaderPort {
  findQuarterById(id: string): Promise<QuarterEntity | null>;
  listQuartersByAssociation(associationId?: string): Promise<QuarterEntity[]>;

  findBuildingById(id: string): Promise<BuildingEntity | null>;
  listBuildingsByQuarter(quarterId?: string): Promise<BuildingEntity[]>;
  countBuildingsByQuarter(quarterId: string): Promise<number>;

  findRoomById(id: string): Promise<RoomEntity | null>;
  findRoomByBuildingAndNumber(buildingId: string, roomNumber: string): Promise<RoomEntity | null>;
  listRoomsByBuilding(buildingId?: string): Promise<RoomEntity[]>;
  countRoomsByBuilding(buildingId: string): Promise<number>;

  findOccupationById(id: string): Promise<RoomOccupationEntity | null>;
  findActiveOccupationsByRoom(roomId: string): Promise<RoomOccupationEntity[]>;
  findActiveOccupationByUser(userId: string): Promise<RoomOccupationEntity | null>;
  listOccupations(filter?: ListOccupationsFilter): Promise<RoomOccupationEntity[]>;

  listResidents(filter?: { associationId?: string; isActive?: boolean }): Promise<ResidentSummary[]>;
  findResidentById(userId: string): Promise<ResidentSummary | null>;

  getStats(associationId?: string): Promise<ResidenceStats>;
}

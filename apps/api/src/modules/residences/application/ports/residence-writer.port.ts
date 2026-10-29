import type { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import type { BuildingEntity } from '../../domain/entities/building.entity.js';
import type { RoomEntity } from '../../domain/entities/room.entity.js';
import type { RoomOccupationEntity } from '../../domain/entities/room-occupation.entity.js';

export const RESIDENCE_WRITER_PORT = Symbol('RESIDENCE_WRITER_PORT');

export interface ResidenceWriterPort {
  saveQuarter(quarter: QuarterEntity): Promise<void>;
  deleteQuarter(id: string): Promise<void>;

  saveBuilding(building: BuildingEntity): Promise<void>;
  deleteBuilding(id: string): Promise<void>;

  saveRoom(room: RoomEntity): Promise<void>;
  deleteRoom(id: string): Promise<void>;

  saveOccupation(occupation: RoomOccupationEntity): Promise<void>;
}


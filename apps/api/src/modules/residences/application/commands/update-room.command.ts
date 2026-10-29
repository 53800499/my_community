import type { RoomStatusValue } from '../../domain/entities/room.entity.js';

export interface UpdateRoomCommand {
  roomId: string;
  roomNumber?: string;
  capacity?: number;
  status?: RoomStatusValue;
  requesterUserId: string;
}

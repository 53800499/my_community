import type { RoomStatusValue } from '../../domain/entities/room.entity.js';

export interface UpdateRoomStatusCommand {
  roomId: string;
  status: RoomStatusValue;
  requesterUserId: string;
}

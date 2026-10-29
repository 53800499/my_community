export interface CreateRoomCommand {
  buildingId: string;
  roomNumber: string;
  capacity?: number;
  requesterUserId: string;
}

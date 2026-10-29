export interface AssignRoomOccupationCommand {
  roomId: string;
  occupantUserId: string;
  associationId: string;
  startDate: Date;
  endDate?: Date;
  requesterUserId: string;
  allowSurplus?: boolean;
  surplusReason?: string;
}

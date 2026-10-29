export interface TerminateRoomOccupationCommand {
  occupationId: string;
  endDate?: Date;
  requesterUserId: string;
}

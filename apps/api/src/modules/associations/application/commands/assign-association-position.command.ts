export interface AssignAssociationPositionCommand {
  associationId: string;
  positionId: string;
  requesterUserId: string;
  targetUserId: string;
  targetUserName: string;
  termStartDate?: Date;
  termEndDate?: Date;
  isPlatformAdmin?: boolean;
}

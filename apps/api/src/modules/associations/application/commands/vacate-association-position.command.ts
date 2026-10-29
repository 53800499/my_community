export interface VacateAssociationPositionCommand {
  associationId: string;
  positionId: string;
  requesterUserId: string;
  isPlatformAdmin?: boolean;
}

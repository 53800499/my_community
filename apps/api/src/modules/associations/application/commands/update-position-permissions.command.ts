export interface UpdatePositionPermissionsCommand {
  associationId: string;
  positionId: string;
  requesterUserId: string;
  accessSpaces: string[];
  permissions: string[];
  isPlatformAdmin?: boolean;
}

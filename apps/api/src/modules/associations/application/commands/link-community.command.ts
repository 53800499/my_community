export interface LinkCommunityCommand {
  associationId: string;
  communityId: string;
  requesterUserId: string;
  isPlatformAdmin?: boolean;
}

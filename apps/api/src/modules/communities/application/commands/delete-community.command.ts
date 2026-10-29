export interface DeleteCommunityCommand {
  communityId: string;
  userId: string;
  isPlatformAdmin?: boolean;
  confirmationName?: string;
}

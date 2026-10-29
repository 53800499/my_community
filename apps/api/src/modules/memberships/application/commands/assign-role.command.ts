import { CommunityRole } from '../../domain/entities/community-membership.entity.js';

export interface AssignRoleCommand {
  communityId: string;
  targetUserId: string;
  adminUserId: string;
  role: CommunityRole;
  action: 'ADD' | 'REMOVE';
  isPlatformAdmin?: boolean;
}

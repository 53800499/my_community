import { MembershipStatus } from '../../domain/entities/community-membership.entity.js';

export interface DecideMembershipCommand {
  communityId: string;
  targetUserId: string;
  deciderUserId: string;
  decision: MembershipStatus;
  isPlatformAdmin?: boolean;
}

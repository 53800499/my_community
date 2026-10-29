import {
  CommunityMembershipEntity,
  MembershipStatus,
} from '../../domain/entities/community-membership.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Adhésions Communautaires (ISP)
 */
export abstract class MembershipReaderPort {
  abstract findById(id: string): Promise<CommunityMembershipEntity | null>;
  abstract findByCommunityAndUser(
    communityId: string,
    userId: string,
  ): Promise<CommunityMembershipEntity | null>;
  abstract listByCommunity(
    communityId: string,
    status?: MembershipStatus,
  ): Promise<CommunityMembershipEntity[]>;
  abstract listByUser(userId: string): Promise<CommunityMembershipEntity[]>;
}

export const MEMBERSHIP_READER_PORT = Symbol('MEMBERSHIP_READER_PORT');

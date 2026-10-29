import { CommunityMembershipEntity } from '../../domain/entities/community-membership.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation des Adhésions Communautaires (ISP)
 */
export abstract class MembershipWriterPort {
  abstract save(membership: CommunityMembershipEntity): Promise<void>;
  abstract updateStatus(membership: CommunityMembershipEntity): Promise<void>;
  abstract updateRoles(membership: CommunityMembershipEntity): Promise<void>;
}

export const MEMBERSHIP_WRITER_PORT = Symbol('MEMBERSHIP_WRITER_PORT');

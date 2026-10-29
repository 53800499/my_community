import { AssociationEntity } from '../../domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import { AssociationCommunityLinkEntity } from '../../domain/entities/association-community-link.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation des Associations et Rattachements (ISP)
 */
export abstract class AssociationWriterPort {
  abstract save(association: AssociationEntity): Promise<void>;
  abstract update(association: AssociationEntity): Promise<void>;
  abstract addMember(member: AssociationMemberEntity): Promise<void>;
  abstract updateMemberRole(member: AssociationMemberEntity): Promise<void>;
  abstract updateMemberProfessionalInfo(
    associationId: string,
    memberId: string,
    info: import('../../domain/entities/association-member.entity.js').MemberProfessionalInfo,
  ): Promise<void>;
  abstract removeMember(associationId: string, userId: string): Promise<void>;
  abstract linkCommunity(link: AssociationCommunityLinkEntity): Promise<void>;
  abstract unlinkCommunity(associationId: string, communityId: string): Promise<void>;
  abstract delete(associationId: string): Promise<void>;
}

export const ASSOCIATION_WRITER_PORT = Symbol('ASSOCIATION_WRITER_PORT');

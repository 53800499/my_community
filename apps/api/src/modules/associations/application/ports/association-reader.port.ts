import { AssociationEntity } from '../../domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import { AssociationCommunityLinkEntity } from '../../domain/entities/association-community-link.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Associations, Membres et Liens Communautaires (ISP)
 */
export abstract class AssociationReaderPort {
  abstract findById(id: string): Promise<AssociationEntity | null>;
  abstract findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<AssociationEntity | null>;
  abstract listAll(): Promise<AssociationEntity[]>;
  abstract listMembers(associationId: string): Promise<AssociationMemberEntity[]>;
  abstract findMember(
    associationId: string,
    userId: string,
  ): Promise<AssociationMemberEntity | null>;
  abstract findMemberById(
    associationId: string,
    memberId: string,
  ): Promise<AssociationMemberEntity | null>;
  abstract listCommunityLinks(
    associationId: string,
  ): Promise<AssociationCommunityLinkEntity[]>;
}

export const ASSOCIATION_READER_PORT = Symbol('ASSOCIATION_READER_PORT');

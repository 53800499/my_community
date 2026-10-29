import {
  CommunityProposalEntity,
  ProposalStatus,
} from '../../domain/entities/community-proposal.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Propositions de Communautés (ISP)
 */
export abstract class CommunityProposalReaderPort {
  abstract findById(id: string): Promise<CommunityProposalEntity | null>;
  abstract findByProposedById(proposedById: string): Promise<CommunityProposalEntity[]>;
  abstract listAll(status?: ProposalStatus): Promise<CommunityProposalEntity[]>;
}

export const COMMUNITY_PROPOSAL_READER_PORT = Symbol('COMMUNITY_PROPOSAL_READER_PORT');

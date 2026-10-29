import { CommunityProposalEntity } from '../../domain/entities/community-proposal.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation des Propositions de Communautés (ISP)
 */
export abstract class CommunityProposalWriterPort {
  abstract save(proposal: CommunityProposalEntity): Promise<void>;
  abstract updateStatus(proposal: CommunityProposalEntity): Promise<void>;
}

export const COMMUNITY_PROPOSAL_WRITER_PORT = Symbol('COMMUNITY_PROPOSAL_WRITER_PORT');

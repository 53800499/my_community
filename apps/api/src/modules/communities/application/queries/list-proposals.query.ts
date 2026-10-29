import { Injectable, Inject } from '@nestjs/common';
import {
  CommunityProposalEntity,
  ProposalStatus,
} from '../../domain/entities/community-proposal.entity.js';
import {
  CommunityProposalReaderPort,
  COMMUNITY_PROPOSAL_READER_PORT,
} from '../ports/proposal-reader.port.js';

export interface ListProposalsParams {
  proposedById?: string;
  status?: ProposalStatus;
}

/**
 * Cas d'Usage de Consultation (Query) : Liste des Propositions de Communauté
 */
@Injectable()
export class ListProposalsQuery {
  constructor(
    @Inject(COMMUNITY_PROPOSAL_READER_PORT)
    private readonly reader: CommunityProposalReaderPort,
  ) {}

  async execute(params?: ListProposalsParams): Promise<CommunityProposalEntity[]> {
    if (params?.proposedById) {
      return this.reader.findByProposedById(params.proposedById);
    }
    return this.reader.listAll(params?.status);
  }
}

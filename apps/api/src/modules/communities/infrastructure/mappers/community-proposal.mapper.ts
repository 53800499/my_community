import type { CommunityProposal as PrismaCommunityProposal } from '@prisma/client';
import {
  CommunityProposalEntity,
  ProposalStatus,
} from '../../domain/entities/community-proposal.entity.js';
import { CommunityProposalResponseDto } from '../../presentation/http/dto/community-proposal-response.dto.js';

export class CommunityProposalMapper {
  public static toDomain(raw: PrismaCommunityProposal): CommunityProposalEntity {
    return CommunityProposalEntity.create({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      justification: raw.justification,
      territoryId: raw.territoryId,
      proposedById: raw.proposedById,
      status: raw.status as ProposalStatus,
      reviewedById: raw.reviewedById,
      reviewedAt: raw.reviewedAt,
      rejectionReason: raw.rejectionReason,
      createdAt: raw.createdAt,
    });
  }

  public static toResponseDto(
    entity: CommunityProposalEntity,
  ): CommunityProposalResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      justification: entity.justification,
      territoryId: entity.territoryId,
      proposedById: entity.proposedById,
      status: entity.status,
      reviewedById: entity.reviewedById,
      reviewedAt: entity.reviewedAt ? entity.reviewedAt.toISOString() : null,
      rejectionReason: entity.rejectionReason,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

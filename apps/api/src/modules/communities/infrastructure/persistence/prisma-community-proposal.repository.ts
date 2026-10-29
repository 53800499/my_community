import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import {
  CommunityProposalEntity,
  ProposalStatus,
} from '../../domain/entities/community-proposal.entity.js';
import { CommunityProposalReaderPort } from '../../application/ports/proposal-reader.port.js';
import { CommunityProposalWriterPort } from '../../application/ports/proposal-writer.port.js';
import { CommunityProposalMapper } from '../mappers/community-proposal.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Propositions Citoyennes
 * Implémente CommunityProposalReaderPort & CommunityProposalWriterPort (ISP & DIP).
 */
@Injectable()
export class PrismaCommunityProposalRepository
  implements CommunityProposalReaderPort, CommunityProposalWriterPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CommunityProposalEntity | null> {
    const raw = await this.prisma.communityProposal.findUnique({
      where: { id },
    });
    return raw ? CommunityProposalMapper.toDomain(raw) : null;
  }

  async findByProposedById(proposedById: string): Promise<CommunityProposalEntity[]> {
    const rows = await this.prisma.communityProposal.findMany({
      where: { proposedById },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => CommunityProposalMapper.toDomain(r));
  }

  async listAll(status?: ProposalStatus): Promise<CommunityProposalEntity[]> {
    const rows = await this.prisma.communityProposal.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => CommunityProposalMapper.toDomain(r));
  }

  async save(proposal: CommunityProposalEntity): Promise<void> {
    await this.prisma.communityProposal.create({
      data: {
        id: proposal.id,
        name: proposal.name,
        description: proposal.description,
        justification: proposal.justification,
        territoryId: proposal.territoryId,
        proposedById: proposal.proposedById,
        status: proposal.status,
        createdAt: proposal.createdAt,
      },
    });
  }

  async updateStatus(proposal: CommunityProposalEntity): Promise<void> {
    await this.prisma.communityProposal.update({
      where: { id: proposal.id },
      data: {
        status: proposal.status,
        reviewedById: proposal.reviewedById,
        reviewedAt: proposal.reviewedAt,
        rejectionReason: proposal.rejectionReason,
      },
    });
  }
}

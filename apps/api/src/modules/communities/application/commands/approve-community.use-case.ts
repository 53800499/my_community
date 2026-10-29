import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { CommunityEntity } from '../../domain/entities/community.entity.js';
import { CommunityApprovalPolicy } from '../../domain/policies/community-approval.policy.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';
import {
  CommunityWriterPort,
  COMMUNITY_WRITER_PORT,
} from '../ports/community-writer.port.js';

export interface ApproveCommunityCommand {
  communityId: string;
  adminId: string;
  isPlatformAdmin: boolean;
}

/**
 * Cas d'Utilisation Applicatif : Approbation d'une Communauté
 *
 * Conforme SOLID :
 * - SRP : Dédié exclusivement à l'orchestration de l'approbation d'une communauté.
 * - OCP : Délègue les règles d'éligibilité à CommunityApprovalPolicy (extensible).
 * - LSP : Fonctionne avec toute implémentation respectant CommunityReaderPort & CommunityWriterPort.
 * - ISP : N'injecte que les ports Reader et Writer nécessaires, sans dépendre d'un God Repository.
 * - DIP : Dépend uniquement des abstractions de ports injectées via les tokens.
 */
@Injectable()
export class ApproveCommunityUseCase {
  constructor(
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader: CommunityReaderPort,
    @Inject(COMMUNITY_WRITER_PORT)
    private readonly communityWriter: CommunityWriterPort,
  ) {}

  async execute(command: ApproveCommunityCommand): Promise<CommunityEntity> {
    const community = await this.communityReader.findById(command.communityId);
    if (!community) {
      throw new NotFoundException(`Communauté introuvable pour l'identifiant ${command.communityId}`);
    }

    const canBeApproved = CommunityApprovalPolicy.canBeApproved(
      community.status,
      command.isPlatformAdmin,
    );

    if (!canBeApproved) {
      throw new ConflictException(
        `La communauté ${community.id} avec le statut ${community.status} ne peut pas être approuvée.`,
      );
    }

    const approvedCommunity = community.activate();
    await this.communityWriter.updateStatus(approvedCommunity.id, 'ACTIVE');

    return approvedCommunity;
  }
}

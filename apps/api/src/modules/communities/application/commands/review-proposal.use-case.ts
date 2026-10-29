import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CommunityProposalEntity,
} from '../../domain/entities/community-proposal.entity.js';
import { CommunityEntity } from '../../domain/entities/community.entity.js';
import { Slug } from '../../domain/value-objects/slug.vo.js';
import {
  CommunityProposalReaderPort,
  COMMUNITY_PROPOSAL_READER_PORT,
} from '../ports/proposal-reader.port.js';
import {
  CommunityProposalWriterPort,
  COMMUNITY_PROPOSAL_WRITER_PORT,
} from '../ports/proposal-writer.port.js';
import {
  CommunityWriterPort,
  COMMUNITY_WRITER_PORT,
} from '../ports/community-writer.port.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';
import { SendNotificationUseCase } from '../../../notifications/application/commands/send-notification.use-case.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { ReviewProposalCommand } from './review-proposal.command.js';

export interface ReviewProposalResult {
  proposal: CommunityProposalEntity;
  community?: CommunityEntity;
}

/**
 * Cas d'Usage Applicatif : Instruction et Revue Administrative d'une Proposition (ReviewProposalUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'arbitrage (approbation ou rejet) et à la création subséquente de la communauté.
 * - DIP : Dépend uniquement des ports reader/writer et des use cases transversaux injectés.
 */
@Injectable()
export class ReviewProposalUseCase {
  constructor(
    @Inject(COMMUNITY_PROPOSAL_READER_PORT)
    private readonly proposalReader: CommunityProposalReaderPort,
    @Inject(COMMUNITY_PROPOSAL_WRITER_PORT)
    private readonly proposalWriter: CommunityProposalWriterPort,
    @Inject(COMMUNITY_WRITER_PORT)
    private readonly communityWriter: CommunityWriterPort,
    @Optional()
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader?: CommunityReaderPort,
    @Optional()
    private readonly sendNotificationUseCase?: SendNotificationUseCase,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: ReviewProposalCommand): Promise<ReviewProposalResult> {
    if (!command.proposalId || command.proposalId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de la proposition est obligatoire.");
    }
    if (!command.reviewerId || command.reviewerId.trim().length === 0) {
      throw new BadRequestException("L'identifiant du réviseur est obligatoire.");
    }

    const proposal = await this.proposalReader.findById(command.proposalId);
    if (!proposal) {
      throw new NotFoundException(`Proposition introuvable pour l'identifiant ${command.proposalId}`);
    }

    if (proposal.status !== 'PENDING') {
      throw new ConflictException(
        `Cette proposition a déjà été traitée avec le statut : ${proposal.status}`,
      );
    }

    if (command.decision === 'APPROVED') {
      proposal.approve(command.reviewerId);

      // Génération d'un slug unique
      let baseSlug = Slug.slugify(proposal.name);
      if (this.communityReader) {
        const existingBySlug = await this.communityReader.findBySlug(baseSlug);
        if (existingBySlug) {
          baseSlug = `${baseSlug}-${randomUUID().slice(0, 6)}`;
        }
      }

      const community = CommunityEntity.create({
        id: randomUUID(),
        name: proposal.name,
        slug: baseSlug,
        description: proposal.description,
        territoryId: proposal.territoryId,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.communityWriter.save(community);
      await this.proposalWriter.updateStatus(proposal);

      // Notification au citoyen proposant
      if (this.sendNotificationUseCase) {
        await this.sendNotificationUseCase.execute({
          userId: proposal.proposedById,
          type: 'COMMUNITY_STATUS',
          title: 'Proposition approuvée !',
          message: `Félicitations ! Votre proposition pour la communauté "${proposal.name}" a été approuvée et l'espace est désormais ouvert.`,
          data: {
            proposalId: proposal.id,
            communityId: community.id,
            slug: community.slug,
          },
        });
      }

      // Tracing d'Audit
      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.reviewerId,
          action: 'COMMUNITY_PROPOSAL_APPROVED',
          resourceType: 'COMMUNITY_PROPOSAL',
          resourceId: proposal.id,
          payload: {
            communityId: community.id,
            name: community.name,
            slug: community.slug,
          },
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }

      return { proposal, community };
    }

    if (command.decision === 'REJECTED') {
      if (!command.rejectionReason || command.rejectionReason.trim().length < 5) {
        throw new BadRequestException('Un motif de rejet d’au moins 5 caractères est obligatoire.');
      }

      proposal.reject(command.reviewerId, command.rejectionReason);
      await this.proposalWriter.updateStatus(proposal);

      // Notification de refus au proposant
      if (this.sendNotificationUseCase) {
        await this.sendNotificationUseCase.execute({
          userId: proposal.proposedById,
          type: 'COMMUNITY_STATUS',
          title: 'Proposition de communauté non retenue',
          message: `Votre proposition "${proposal.name}" n'a pas été retenue. Motif : ${command.rejectionReason}`,
          data: {
            proposalId: proposal.id,
            rejectionReason: command.rejectionReason,
          },
        });
      }

      // Tracing d'Audit
      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.reviewerId,
          action: 'COMMUNITY_PROPOSAL_REJECTED',
          resourceType: 'COMMUNITY_PROPOSAL',
          resourceId: proposal.id,
          payload: {
            rejectionReason: command.rejectionReason,
          },
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }

      return { proposal };
    }

    throw new BadRequestException(`Décision inconnue : ${command.decision}`);
  }
}

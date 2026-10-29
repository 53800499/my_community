import { Injectable, Inject, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommunityProposalEntity } from '../../domain/entities/community-proposal.entity.js';
import {
  CommunityProposalWriterPort,
  COMMUNITY_PROPOSAL_WRITER_PORT,
} from '../ports/proposal-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { SubmitProposalCommand } from './submit-proposal.command.js';

/**
 * Cas d'Usage Applicatif : Soumission d'une Proposition Citoyenne de Communauté
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'enregistrement initial de la proposition.
 * - DIP : Dépend des abstractions injectées (ports).
 */
@Injectable()
export class SubmitProposalUseCase {
  constructor(
    @Inject(COMMUNITY_PROPOSAL_WRITER_PORT)
    private readonly proposalWriter: CommunityProposalWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: SubmitProposalCommand): Promise<CommunityProposalEntity> {
    const proposal = CommunityProposalEntity.create({
      id: randomUUID(),
      name: command.name,
      description: command.description,
      justification: command.justification,
      territoryId: command.territoryId,
      proposedById: command.proposedById,
    });

    await this.proposalWriter.save(proposal);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.proposedById,
        action: 'COMMUNITY_PROPOSAL_SUBMITTED',
        resourceType: 'COMMUNITY_PROPOSAL',
        resourceId: proposal.id,
        payload: {
          name: proposal.name,
          territoryId: proposal.territoryId,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return proposal;
  }
}

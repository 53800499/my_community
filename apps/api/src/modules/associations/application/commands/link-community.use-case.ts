import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationCommunityLinkEntity } from '../../domain/entities/association-community-link.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from '../ports/association-writer.port.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../../../communities/application/ports/community-reader.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { LinkCommunityCommand } from './link-community.command.js';

/**
 * Cas d'Usage Applicatif : Multi-Rattachement Territorial Association <-> Communauté (N-N)
 * Conforme Contextual RBAC :
 * - Vérifie que le demandeur est membre du bureau exécutif (PRESIDENT, SECRETARY) de l'association.
 */
@Injectable()
export class LinkCommunityUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly associationReader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly associationWriter: AssociationWriterPort,
    @Optional()
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader?: CommunityReaderPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: LinkCommunityCommand): Promise<AssociationCommunityLinkEntity> {
    if (!command.associationId || !command.communityId || !command.requesterUserId) {
      throw new BadRequestException('Paramètres obligatoires manquants.');
    }

    const association = await this.associationReader.findById(command.associationId);
    if (!association) {
      throw new NotFoundException(`Association ${command.associationId} introuvable.`);
    }

    if (this.communityReader) {
      const community = await this.communityReader.findById(command.communityId);
      if (!community) {
        throw new NotFoundException(`Communauté ${command.communityId} introuvable.`);
      }
    }

    // Vérification Contextuelle RBAC : Requester doit appartenir au bureau exécutif de l'association
    if (!command.isPlatformAdmin) {
      const member = await this.associationReader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!member || !member.isExecutiveBureau()) {
        throw new ForbiddenException(
          'Seul un membre du bureau exécutif de l’association (Président, Secrétaire, Trésorier) peut la rattacher à un espace communautaire.',
        );
      }
    }

    const existingLinks = await this.associationReader.listCommunityLinks(
      command.associationId,
    );
    const alreadyLinked = existingLinks.some(
      (l) => l.communityId === command.communityId,
    );
    if (alreadyLinked) {
      throw new BadRequestException(
        "L'association est déjà rattachée à cette communauté.",
      );
    }

    const link = AssociationCommunityLinkEntity.create({
      id: randomUUID(),
      associationId: command.associationId,
      communityId: command.communityId,
    });

    await this.associationWriter.linkCommunity(link);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.requesterUserId,
        action: 'ASSOCIATION_COMMUNITY_LINKED',
        resourceType: 'ASSOCIATION_COMMUNITY',
        resourceId: link.id,
        payload: {
          associationId: command.associationId,
          communityId: command.communityId,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return link;
  }
}

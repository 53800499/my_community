import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommunityMembershipEntity } from '../../domain/entities/community-membership.entity.js';
import {
  MembershipReaderPort,
  MEMBERSHIP_READER_PORT,
} from '../ports/membership-reader.port.js';
import {
  MembershipWriterPort,
  MEMBERSHIP_WRITER_PORT,
} from '../ports/membership-writer.port.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../../../communities/application/ports/community-reader.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { RequestMembershipCommand } from './request-membership.command.js';

/**
 * Cas d'Usage Applicatif : Demande d'Adhésion Citoyenne (RequestMembershipUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la création d'une demande d'adhésion en état PENDING.
 * - DIP : Dépend des ports abstraits (Reader, Writer, CommunityReader, Audit).
 */
@Injectable()
export class RequestMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_READER_PORT)
    private readonly membershipReader: MembershipReaderPort,
    @Inject(MEMBERSHIP_WRITER_PORT)
    private readonly membershipWriter: MembershipWriterPort,
    @Optional()
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader?: CommunityReaderPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: RequestMembershipCommand): Promise<CommunityMembershipEntity> {
    if (!command.communityId || command.communityId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de la communauté est obligatoire.");
    }
    if (!command.userId || command.userId.trim().length === 0) {
      throw new BadRequestException("L'identifiant du citoyen est obligatoire.");
    }

    if (this.communityReader) {
      const community = await this.communityReader.findById(command.communityId);
      if (!community) {
        throw new NotFoundException(`Communauté ${command.communityId} introuvable.`);
      }
    }

    const existing = await this.membershipReader.findByCommunityAndUser(
      command.communityId,
      command.userId,
    );

    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new ConflictException('Vous êtes déjà membre actif de cette communauté.');
      }
      if (existing.status === 'PENDING') {
        throw new ConflictException('Une demande d’adhésion est déjà en attente d’instruction.');
      }
      throw new ConflictException(
        `Votre adhésion précédente a le statut : ${existing.status}. Contactez le gestionnaire local.`,
      );
    }

    const membership = CommunityMembershipEntity.create({
      id: randomUUID(),
      communityId: command.communityId,
      userId: command.userId,
      status: 'PENDING',
      roles: ['MEMBER'],
    });

    await this.membershipWriter.save(membership);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.userId,
        action: 'COMMUNITY_MEMBERSHIP_REQUESTED',
        resourceType: 'COMMUNITY_MEMBERSHIP',
        resourceId: membership.id,
        payload: {
          communityId: command.communityId,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return membership;
  }
}

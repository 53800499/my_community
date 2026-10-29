import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from '../ports/association-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { ManageAssociationMemberCommand } from './manage-association-member.command.js';

/**
 * Cas d'Usage Applicatif : Gestion du Bureau et des Membres Associatifs (ManageAssociationMemberUseCase)
 * Conforme Contextual RBAC :
 * - Seul le PRESIDENT de l'association (ou SuperAdmin) peut nommer les membres du bureau.
 */
@Injectable()
export class ManageAssociationMemberUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly writer: AssociationWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(
    command: ManageAssociationMemberCommand,
  ): Promise<AssociationMemberEntity | null> {
    if (!command.associationId || !command.requesterUserId || !command.targetUserId) {
      throw new BadRequestException('Paramètres requis manquants.');
    }

    if (!command.isPlatformAdmin) {
      const requester = await this.reader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!requester || !requester.isPresident()) {
        throw new ForbiddenException(
          'Seul le Président de l’association peut nommer ou modifier les membres du bureau.',
        );
      }
    }

    const existing = await this.reader.findMember(
      command.associationId,
      command.targetUserId,
    );

    if (command.action === 'ADD') {
      if (existing) {
        throw new BadRequestException('Cet utilisateur est déjà affilié à l’association.');
      }
      const member = AssociationMemberEntity.create({
        id: randomUUID(),
        associationId: command.associationId,
        userId: command.targetUserId,
        role: command.role ?? 'MEMBER',
      });
      await this.writer.addMember(member);

      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MEMBER_ADDED',
          resourceType: 'ASSOCIATION_MEMBER',
          resourceId: member.id,
          payload: {
            associationId: command.associationId,
            targetUserId: command.targetUserId,
            role: member.role,
          },
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }
      return member;
    }

    if (command.action === 'UPDATE') {
      if (!existing) {
        throw new NotFoundException('Membre introuvable dans cette association.');
      }
      existing.updateRole(command.role);
      await this.writer.updateMemberRole(existing);

      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MEMBER_ROLE_UPDATED',
          resourceType: 'ASSOCIATION_MEMBER',
          resourceId: existing.id,
          payload: {
            associationId: command.associationId,
            targetUserId: command.targetUserId,
            role: command.role,
          },
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }
      return existing;
    }

    if (command.action === 'REMOVE') {
      if (!existing) {
        throw new NotFoundException('Membre introuvable dans cette association.');
      }
      if (existing.isPresident()) {
        throw new BadRequestException('Le Président ne peut pas être révoqué directement.');
      }
      await this.writer.removeMember(command.associationId, command.targetUserId);

      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MEMBER_REMOVED',
          resourceType: 'ASSOCIATION_MEMBER',
          resourceId: existing.id,
          payload: {
            associationId: command.associationId,
            targetUserId: command.targetUserId,
          },
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }
      return null;
    }

    throw new BadRequestException(`Action inconnue: ${command.action}`);
  }
}

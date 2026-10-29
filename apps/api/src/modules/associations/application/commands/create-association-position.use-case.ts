import {
  Injectable,
  Inject,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationPositionWriterPort,
  ASSOCIATION_POSITION_WRITER_PORT,
} from '../ports/association-position-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { CreateAssociationPositionCommand } from './create-association-position.command.js';

/**
 * Cas d'Usage Applicatif : Création d'un Poste dans l'Organigramme Associatif (SRP & OCP)
 * Seul le Président de l'association (ou un SuperAdmin) a autorité pour structurer l'organigramme.
 */
@Injectable()
export class CreateAssociationPositionUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
    @Inject(ASSOCIATION_POSITION_WRITER_PORT)
    private readonly writer: AssociationPositionWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: CreateAssociationPositionCommand): Promise<AssociationPositionEntity> {
    if (!command.associationId || !command.requesterUserId || !command.title) {
      throw new BadRequestException('Paramètres requis manquants.');
    }

    // Contextual RBAC : Vérifier les droits du demandeur
    if (!command.isPlatformAdmin) {
      const requester = await this.reader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!requester || !requester.isPresident()) {
        throw new ForbiddenException(
          'Seul le Président de l’association peut créer de nouveaux postes dans l’organigramme.',
        );
      }
    }

    const position = AssociationPositionEntity.create({
      id: randomUUID(),
      associationId: command.associationId,
      title: command.title,
      roleCategory: command.roleCategory ?? 'BOARD_MEMBER',
      department: command.department || 'Bureau Exécutif',
      description: command.description,
      assignedUserId: command.assignedUserId ?? null,
      assignedUserName: command.assignedUserName ?? null,
      termStartDate: command.termStartDate,
      termEndDate: command.termEndDate,
      isStatutory: false,
    });

    await this.writer.savePosition(position);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.requesterUserId,
        action: 'ASSOCIATION_POSITION_CREATED',
        resourceType: 'ASSOCIATION_POSITION',
        resourceId: position.id,
        payload: {
          associationId: command.associationId,
          title: position.title,
          department: position.department,
          assignedUserId: position.assignedUserId,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return position;
  }
}

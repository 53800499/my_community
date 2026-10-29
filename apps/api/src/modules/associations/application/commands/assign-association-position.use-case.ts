import {
  Injectable,
  Inject,
  NotFoundException,
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
  AssociationPositionReaderPort,
  ASSOCIATION_POSITION_READER_PORT,
} from '../ports/association-position-reader.port.js';
import {
  AssociationPositionWriterPort,
  ASSOCIATION_POSITION_WRITER_PORT,
} from '../ports/association-position-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { AssignAssociationPositionCommand } from './assign-association-position.command.js';

/**
 * Cas d'Usage Applicatif : Nomination / Affectation à un Poste de Gouvernance (SRP)
 */
@Injectable()
export class AssignAssociationPositionUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_POSITION_READER_PORT)
    private readonly positionReader: AssociationPositionReaderPort,
    @Inject(ASSOCIATION_POSITION_WRITER_PORT)
    private readonly positionWriter: AssociationPositionWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: AssignAssociationPositionCommand): Promise<AssociationPositionEntity> {
    if (
      !command.associationId ||
      !command.positionId ||
      !command.requesterUserId ||
      !command.targetUserId
    ) {
      throw new BadRequestException('Paramètres requis manquants.');
    }

    if (!command.isPlatformAdmin) {
      const requester = await this.assocReader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!requester || !requester.isPresident()) {
        throw new ForbiddenException(
          'Seul le Président de l’association peut nommer ou affecter un responsable à un poste.',
        );
      }
    }

    const position = await this.positionReader.findPositionById(
      command.associationId,
      command.positionId,
    );
    if (!position) {
      throw new NotFoundException('Poste introuvable dans cette association.');
    }

    const targetMember = await this.assocReader.findMember(
      command.associationId,
      command.targetUserId,
    );
    if (!targetMember) {
      throw new BadRequestException(
        "Seul un membre adhérent enregistré de l'association peut être nommé à ce poste.",
      );
    }

    position.assignMember({
      userId: command.targetUserId,
      userName: command.targetUserName,
      termStartDate: command.termStartDate,
      termEndDate: command.termEndDate,
    });

    await this.positionWriter.updatePosition(position);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.requesterUserId,
        action: 'ASSOCIATION_POSITION_ASSIGNED',
        resourceType: 'ASSOCIATION_POSITION',
        resourceId: position.id,
        payload: {
          associationId: command.associationId,
          positionTitle: position.title,
          assignedUserId: command.targetUserId,
          assignedUserName: command.targetUserName,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return position;
  }
}

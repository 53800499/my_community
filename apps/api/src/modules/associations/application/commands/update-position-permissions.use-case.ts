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
import { UpdatePositionPermissionsCommand } from './update-position-permissions.command.js';

/**
 * Cas d'Usage Applicatif : Configuration des Espaces d'Accès et Permissions d'un Poste (SRP & OCP)
 * Seul le Président (ou SuperAdmin) peut octroyer ou restreindre les accès aux différents espaces.
 */
@Injectable()
export class UpdatePositionPermissionsUseCase {
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

  async execute(command: UpdatePositionPermissionsCommand): Promise<AssociationPositionEntity> {
    if (!command.associationId || !command.positionId || !command.requesterUserId) {
      throw new BadRequestException('Paramètres requis manquants.');
    }

    if (!command.isPlatformAdmin) {
      const requester = await this.assocReader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!requester || !requester.isPresident()) {
        throw new ForbiddenException(
          'Seul le Président de l’association a autorité pour configurer les permissions et espaces d’accès.',
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

    position.updatePermissions({
      accessSpaces: command.accessSpaces || [],
      permissions: command.permissions || [],
    });

    await this.positionWriter.updatePosition(position);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.requesterUserId,
        action: 'ASSOCIATION_POSITION_PERMISSIONS_UPDATED',
        resourceType: 'ASSOCIATION_POSITION',
        resourceId: position.id,
        payload: {
          associationId: command.associationId,
          positionTitle: position.title,
          accessSpaces: position.accessSpaces,
          permissionsCount: position.permissions.length,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return position;
  }
}

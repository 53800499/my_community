import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationEntity } from '../../domain/entities/association.entity.js';
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
import { RegisterAssociationCommand } from './register-association.command.js';

export interface RegisterAssociationResult {
  association: AssociationEntity;
  presidentMember: AssociationMemberEntity;
}

/**
 * Cas d'Usage Applicatif : Déclaration et Enregistrement d'une Association Citoyenne
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'enregistrement légal de l'association et la désignation du président fondateur.
 * - DIP : Dépend des abstractions injectées.
 */
@Injectable()
export class RegisterAssociationUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly writer: AssociationWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: RegisterAssociationCommand): Promise<RegisterAssociationResult> {
    if (!command.presidentUserId || command.presidentUserId.trim().length === 0) {
      throw new BadRequestException("L'identifiant du président fondateur est obligatoire.");
    }

    if (command.registrationNumber && command.registrationNumber.trim().length > 0) {
      const existing = await this.reader.findByRegistrationNumber(
        command.registrationNumber.trim(),
      );
      if (existing) {
        throw new ConflictException(
          `Une association avec le numéro d'enregistrement "${command.registrationNumber}" existe déjà.`,
        );
      }
    }

    const association = AssociationEntity.create({
      id: randomUUID(),
      name: command.name,
      acronym: command.acronym,
      registrationNumber: command.registrationNumber,
      description: command.description,
    });

    await this.writer.save(association);

    const presidentMember = AssociationMemberEntity.create({
      id: randomUUID(),
      associationId: association.id,
      userId: command.presidentUserId,
      role: 'PRESIDENT',
    });

    await this.writer.addMember(presidentMember);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.presidentUserId,
        action: 'ASSOCIATION_REGISTERED',
        resourceType: 'ASSOCIATION',
        resourceId: association.id,
        payload: {
          name: association.name,
          registrationNumber: association.registrationNumber,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return { association, presidentMember };
  }
}

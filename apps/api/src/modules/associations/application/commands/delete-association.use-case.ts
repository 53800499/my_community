import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from '../ports/association-writer.port.js';
import {
  AuditLoggerPort,
  AUDIT_LOGGER_PORT,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { DeleteAssociationCommand } from './delete-association.command.js';

/**
 * Cas d'Utilisation Applicatif : Dissolution et Suppression d'une Association Citoyenne (DeleteAssociationUseCase)
 *
 * Conforme SOLID :
 * - SRP : Dédié exclusivement à la dissolution et suppression sécurisée d'une association.
 * - DIP : Dépend des abstractions de ports injectées via les tokens.
 *
 * Règles Métier & Sécurité :
 * - Autorité : Réservé au Président fondateur de l'association ou aux Administrateurs Plateforme.
 * - Double confirmation : Le nom de l'association doit concorder pour éviter toute suppression involontaire.
 * - Traçabilité : Enregistrement immuable dans le registre d'audit (`ASSOCIATION_DISSOLVED`).
 */
@Injectable()
export class DeleteAssociationUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly writer: AssociationWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: DeleteAssociationCommand): Promise<{ success: boolean; associationId: string }> {
    if (!command.associationId || command.associationId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de l'association est obligatoire.");
    }

    const association = await this.reader.findById(command.associationId);
    if (!association) {
      throw new NotFoundException(`Association introuvable pour l'identifiant ${command.associationId}`);
    }

    // Vérification de l'autorité légale
    const members = await this.reader.findMembers(command.associationId);
    const actorMember = members.find((m) => m.userId === command.userId);
    const isPresident = actorMember?.role === 'PRESIDENT';
    const isAuthorized = isPresident || Boolean(command.isPlatformAdmin);

    if (!isAuthorized) {
      throw new ForbiddenException(
        "Seul le Président de l'association ou un Administrateur Général de la plateforme est habilité à prononcer la dissolution ou la suppression de cette association.",
      );
    }

    // Double confirmation anti-erreur
    if (command.confirmationName !== undefined) {
      const cleanExpected = association.name.trim().toLowerCase();
      const cleanProvided = command.confirmationName.trim().toLowerCase();
      if (cleanExpected !== cleanProvided) {
        throw new BadRequestException(
          `Le nom de confirmation "${command.confirmationName}" ne correspond pas au nom exact de l'association "${association.name}".`,
        );
      }
    }

    // Exécution de la suppression
    await this.writer.delete(association.id);

    // Journalisation d'audit immuable
    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.userId || 'system-admin',
        action: 'ASSOCIATION_DISSOLVED',
        resourceType: 'ASSOCIATION',
        resourceId: association.id,
        payload: {
          name: association.name,
          registrationNumber: association.registrationNumber,
          category: association.category,
          dissolvedAt: new Date().toISOString(),
          membersCountAtDissolution: members.length,
        },
      });
      await this.auditLogger.log(auditLog);
    }

    return {
      success: true,
      associationId: association.id,
    };
  }
}

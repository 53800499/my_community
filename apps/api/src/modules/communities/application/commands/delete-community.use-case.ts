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
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';
import {
  CommunityWriterPort,
  COMMUNITY_WRITER_PORT,
} from '../ports/community-writer.port.js';
import {
  AuditLoggerPort,
  AUDIT_LOGGER_PORT,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { DeleteCommunityCommand } from './delete-community.command.js';

/**
 * Cas d'Utilisation Applicatif : Suppression d'une Communauté (DeleteCommunityUseCase)
 *
 * Conforme SOLID :
 * - SRP : Dédié exclusivement à la suppression contrôlée et sécurisée d'une communauté citoyenne.
 * - DIP : Dépend des ports reader/writer et audit injectés.
 *
 * Règles Métier :
 * - Autorité : Réservé aux Administrateurs Plateforme ou Autorités Territoriales.
 * - Confirmation de sécurité : Si un nom de confirmation est transmis, il doit concorder exactement.
 * - Traçabilité : Journalisation immuable dans l'audit.
 */
@Injectable()
export class DeleteCommunityUseCase {
  constructor(
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader: CommunityReaderPort,
    @Inject(COMMUNITY_WRITER_PORT)
    private readonly communityWriter: CommunityWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: DeleteCommunityCommand): Promise<{ success: boolean; communityId: string }> {
    if (!command.communityId || command.communityId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de la communauté est obligatoire.");
    }

    const community = await this.communityReader.findById(command.communityId);
    if (!community) {
      throw new NotFoundException(`Communauté introuvable pour l'identifiant ${command.communityId}`);
    }

    // Contrôle d'autorité : Seul un administrateur plateforme ou modérateur territorial peut supprimer
    if (command.isPlatformAdmin === false) {
      throw new ForbiddenException(
        "Seuls les administrateurs de la plateforme ou les autorités territoriales ont le privilège de dissoudre ou supprimer une communauté.",
      );
    }

    // Confirmation anti-erreur
    if (command.confirmationName !== undefined) {
      const cleanExpected = community.name.trim().toLowerCase();
      const cleanProvided = command.confirmationName.trim().toLowerCase();
      if (cleanExpected !== cleanProvided) {
        throw new BadRequestException(
          `Le nom de confirmation "${command.confirmationName}" ne correspond pas au nom exact de la communauté "${community.name}".`,
        );
      }
    }

    // Suppression via le port écrivain
    await this.communityWriter.delete(community.id);

    // Journalisation d'audit
    if (this.auditLogger) {
      const log = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.userId || 'system-admin',
        action: 'COMMUNITY_DELETED',
        resourceType: 'COMMUNITY',
        resourceId: community.id,
        payload: {
          name: community.name,
          slug: community.slug,
          territoryId: community.territoryId,
          deletedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(log);
    }

    return {
      success: true,
      communityId: community.id,
    };
  }
}

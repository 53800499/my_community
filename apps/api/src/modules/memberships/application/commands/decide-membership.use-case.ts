import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
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
import { SendNotificationUseCase } from '../../../notifications/application/commands/send-notification.use-case.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { DecideMembershipCommand } from './decide-membership.command.js';

/**
 * Cas d'Usage Applicatif : Décision Administrative sur une Adhésion (DecideMembershipUseCase)
 * Conforme Contextual RBAC (doc: docs/security/roles-et-permissions-rbac.md) :
 * - Vérifie que le réviseur possède le rôle MANAGER ou ADMIN au sein de la communauté (ou est SuperAdmin).
 * - Notifie l'utilisateur cible et consigne la trace d'audit immuable.
 */
@Injectable()
export class DecideMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_READER_PORT)
    private readonly reader: MembershipReaderPort,
    @Inject(MEMBERSHIP_WRITER_PORT)
    private readonly writer: MembershipWriterPort,
    @Optional()
    private readonly sendNotificationUseCase?: SendNotificationUseCase,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: DecideMembershipCommand): Promise<CommunityMembershipEntity> {
    if (!command.communityId || !command.targetUserId || !command.deciderUserId) {
      throw new BadRequestException('Paramètres obligatoires manquants.');
    }

    // Vérification Contextuelle RBAC : Le réviseur doit être MANAGER/ADMIN de cette communauté
    if (!command.isPlatformAdmin) {
      const deciderMembership = await this.reader.findByCommunityAndUser(
        command.communityId,
        command.deciderUserId,
      );
      if (!deciderMembership || !deciderMembership.isManagerOrAdmin()) {
        throw new ForbiddenException(
          'Seul un gestionnaire ou un administrateur local de cette communauté peut instruire les adhésions.',
        );
      }
    }

    const membership = await this.reader.findByCommunityAndUser(
      command.communityId,
      command.targetUserId,
    );
    if (!membership) {
      throw new NotFoundException('Demande d’adhésion introuvable pour ce citoyen.');
    }

    switch (command.decision) {
      case 'ACTIVE':
        membership.approve();
        break;
      case 'SUSPENDED':
        membership.suspend();
        break;
      case 'REVOKED':
        membership.revoke();
        break;
      default:
        throw new BadRequestException(`Décision d'adhésion invalide: ${command.decision}`);
    }

    await this.writer.updateStatus(membership);

    if (this.sendNotificationUseCase) {
      const isApproved = command.decision === 'ACTIVE';
      await this.sendNotificationUseCase.execute({
        userId: command.targetUserId,
        type: 'MEMBERSHIP_REQUEST',
        title: isApproved
          ? 'Adhésion communautaire acceptée !'
          : `Mise à jour de votre adhésion (${command.decision})`,
        message: isApproved
          ? 'Félicitations ! Votre demande d’adhésion à la communauté a été acceptée avec succès.'
          : `Votre statut d'adhésion à la communauté est désormais : ${command.decision}.`,
        data: {
          communityId: command.communityId,
          status: command.decision,
        },
      });
    }

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.deciderUserId,
        action: `COMMUNITY_MEMBERSHIP_${command.decision}`,
        resourceType: 'COMMUNITY_MEMBERSHIP',
        resourceId: membership.id,
        payload: {
          communityId: command.communityId,
          targetUserId: command.targetUserId,
          decision: command.decision,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return membership;
  }
}

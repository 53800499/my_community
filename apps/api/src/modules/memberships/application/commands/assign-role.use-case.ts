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
import { AssignRoleCommand } from './assign-role.command.js';

/**
 * Cas d'Usage Applicatif : Attribution ou Retrait d'un Rôle Contextuel Local (AssignRoleUseCase)
 * Conforme Contextual RBAC :
 * - Seul un ADMIN de la communauté (ou SuperAdmin) peut promouvoir ou modifier des rôles.
 */
@Injectable()
export class AssignRoleUseCase {
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

  async execute(command: AssignRoleCommand): Promise<CommunityMembershipEntity> {
    if (!command.communityId || !command.targetUserId || !command.adminUserId || !command.role) {
      throw new BadRequestException('Paramètres requis manquants.');
    }

    if (!command.isPlatformAdmin) {
      const adminMembership = await this.reader.findByCommunityAndUser(
        command.communityId,
        command.adminUserId,
      );
      if (!adminMembership || !adminMembership.hasRole('ADMIN')) {
        throw new ForbiddenException(
          'Seul un administrateur local de cette communauté peut attribuer ou modifier des rôles.',
        );
      }
    }

    const membership = await this.reader.findByCommunityAndUser(
      command.communityId,
      command.targetUserId,
    );
    if (!membership) {
      throw new NotFoundException('Adhésion introuvable pour ce citoyen.');
    }

    if (command.action === 'ADD') {
      membership.assignRole(command.role);
    } else if (command.action === 'REMOVE') {
      membership.removeRole(command.role);
    } else {
      throw new BadRequestException(`Action inconnue: ${command.action}`);
    }

    await this.writer.updateRoles(membership);

    if (this.sendNotificationUseCase) {
      await this.sendNotificationUseCase.execute({
        userId: command.targetUserId,
        type: 'SYSTEM',
        title: 'Mise à jour de votre rôle communautaire',
        message:
          command.action === 'ADD'
            ? `Vous avez été promu avec le rôle "${command.role}" dans la communauté.`
            : `Le rôle "${command.role}" vous a été retiré dans la communauté.`,
        data: {
          communityId: command.communityId,
          role: command.role,
          action: command.action,
        },
      });
    }

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.adminUserId,
        action: `COMMUNITY_ROLE_${command.action}`,
        resourceType: 'COMMUNITY_MEMBERSHIP',
        resourceId: membership.id,
        payload: {
          communityId: command.communityId,
          targetUserId: command.targetUserId,
          role: command.role,
          action: command.action,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return membership;
  }
}

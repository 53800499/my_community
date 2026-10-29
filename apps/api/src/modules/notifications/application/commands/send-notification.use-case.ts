import { Injectable, Inject, BadRequestException, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import { NotificationWriterPort, NOTIFICATION_WRITER_PORT } from '../ports/notification-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { SendNotificationCommand } from './send-notification.command.js';

/**
 * Cas d'Usage Applicatif : Envoi d'une Notification Citoyenne (SendNotificationUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'instanciation, la persistance et l'audit d'une notification.
 * - DIP : Dépend uniquement des abstractions de ports injectés par Symbol tokens.
 */
@Injectable()
export class SendNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_WRITER_PORT)
    private readonly writer: NotificationWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: SendNotificationCommand): Promise<NotificationEntity> {
    if (!command.userId || command.userId.trim().length === 0) {
      throw new BadRequestException("L'identifiant du destinataire est obligatoire.");
    }

    const notification = NotificationEntity.create({
      id: randomUUID(),
      userId: command.userId,
      type: command.type,
      title: command.title,
      message: command.message,
      data: command.data ?? null,
    });

    await this.writer.save(notification);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: null,
        action: 'NOTIFICATION_SENT',
        resourceType: 'NOTIFICATION',
        resourceId: notification.id,
        payload: {
          recipientId: notification.userId,
          type: notification.type,
          title: notification.title,
        },
        createdAt: new Date(),
      });
      await this.auditLogger.log(auditLog);
    }

    return notification;
  }
}

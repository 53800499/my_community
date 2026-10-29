import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import {
  NotificationReaderPort,
  NOTIFICATION_READER_PORT,
} from '../ports/notification-reader.port.js';
import {
  NotificationWriterPort,
  NOTIFICATION_WRITER_PORT,
} from '../ports/notification-writer.port.js';
import { MarkNotificationAsReadCommand } from './mark-notification-as-read.command.js';

/**
 * Cas d'Usage Applicatif : Marquer une notification comme lue (MarkNotificationAsReadUseCase)
 * Conforme SOLID :
 * - SRP : Dédié à la transition d'état d'une notification vers lue.
 * - Sécurité Contextuelle : Protection IDOR stricte (vérification que notification.userId === requestingUserId).
 */
@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_READER_PORT)
    private readonly reader: NotificationReaderPort,
    @Inject(NOTIFICATION_WRITER_PORT)
    private readonly writer: NotificationWriterPort,
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<NotificationEntity> {
    if (!command.notificationId || command.notificationId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de la notification est obligatoire.");
    }

    const notification = await this.reader.findById(command.notificationId);
    if (!notification) {
      throw new NotFoundException('Notification introuvable.');
    }

    // Protection anti-IDOR : seul le destinataire légitime a le droit de modifier le statut de sa notification
    if (notification.userId !== command.userId) {
      throw new ForbiddenException('Accès refusé à cette notification.');
    }

    notification.markAsRead();
    await this.writer.markAsRead(notification.id, notification.readAt!);

    return notification;
  }
}

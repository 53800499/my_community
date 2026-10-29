import { NotificationEntity } from '../../domain/entities/notification.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation des Notifications (ISP)
 * Ségrégation stricte des opérations d'écriture pour le domaine Notifications.
 */
export abstract class NotificationWriterPort {
  abstract save(notification: NotificationEntity): Promise<void>;
  abstract markAsRead(id: string, readAt: Date): Promise<void>;
  abstract markAllAsRead(userId: string): Promise<void>;
}

export const NOTIFICATION_WRITER_PORT = Symbol('NOTIFICATION_WRITER_PORT');

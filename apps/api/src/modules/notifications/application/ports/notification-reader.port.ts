import { NotificationEntity } from '../../domain/entities/notification.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Notifications (ISP)
 * Ségrégation stricte des opérations de lecture pour le domaine Notifications.
 */
export abstract class NotificationReaderPort {
  abstract findById(id: string): Promise<NotificationEntity | null>;
  abstract findByUserId(userId: string, unreadOnly?: boolean): Promise<NotificationEntity[]>;
  abstract countUnreadByUserId(userId: string): Promise<number>;
}

export const NOTIFICATION_READER_PORT = Symbol('NOTIFICATION_READER_PORT');

/**
 * Façade Publique Stricte du Module Notifications (Niveau 1)
 * Règle de Verrouillage (Gate Lock) : Une fois le module verrouillé, cette façade est figée.
 */

// Module
export { NotificationsModule } from './notifications.module.js';

// Domaine
export { NotificationEntity } from './domain/entities/notification.entity.js';
export type {
  NotificationType,
  NotificationProps,
} from './domain/entities/notification.entity.js';
export { NotificationSentEvent } from './domain/events/notification-sent.event.js';
export { NotificationReadEvent } from './domain/events/notification-read.event.js';

// Ports
export {
  NotificationReaderPort,
  NOTIFICATION_READER_PORT,
} from './application/ports/notification-reader.port.js';
export {
  NotificationWriterPort,
  NOTIFICATION_WRITER_PORT,
} from './application/ports/notification-writer.port.js';

// Cas d'Usage & Requêtes
export {
  SendNotificationUseCase,
} from './application/commands/send-notification.use-case.js';
export type { SendNotificationCommand } from './application/commands/send-notification.command.js';

export {
  MarkNotificationAsReadUseCase,
} from './application/commands/mark-notification-as-read.use-case.js';
export type { MarkNotificationAsReadCommand } from './application/commands/mark-notification-as-read.command.js';

export {
  ListUserNotificationsQuery,
} from './application/queries/list-user-notifications.query.js';
export type { ListUserNotificationsParams } from './application/queries/list-user-notifications.query.js';

// DTOs publics
export { NotificationResponseDto } from './presentation/http/dto/notification-response.dto.js';

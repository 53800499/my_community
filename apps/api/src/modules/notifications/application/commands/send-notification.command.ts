import { NotificationType } from '../../domain/entities/notification.entity.js';

export interface SendNotificationCommand {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
}

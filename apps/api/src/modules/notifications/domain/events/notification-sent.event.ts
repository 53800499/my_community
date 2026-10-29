import { NotificationType } from '../entities/notification.entity.js';

/**
 * Événement Métier Découplé : NotificationSentEvent
 * Émis lorsqu'une nouvelle notification est envoyée à un citoyen.
 */
export class NotificationSentEvent {
  public static readonly EVENT_NAME = 'notification.sent';

  public readonly notificationId: string;
  public readonly userId: string;
  public readonly type: NotificationType;
  public readonly title: string;
  public readonly sentAt: Date;

  constructor(props: {
    notificationId: string;
    userId: string;
    type: NotificationType;
    title: string;
    sentAt: Date;
  }) {
    this.notificationId = props.notificationId;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.sentAt = props.sentAt;
  }
}

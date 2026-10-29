/**
 * Événement Métier Découplé : NotificationReadEvent
 * Émis lorsqu'un utilisateur prend connaissance d'une notification.
 */
export class NotificationReadEvent {
  public static readonly EVENT_NAME = 'notification.read';

  public readonly notificationId: string;
  public readonly userId: string;
  public readonly readAt: Date;

  constructor(props: {
    notificationId: string;
    userId: string;
    readAt: Date;
  }) {
    this.notificationId = props.notificationId;
    this.userId = props.userId;
    this.readAt = props.readAt;
  }
}

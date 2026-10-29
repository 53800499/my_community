export type NotificationType =
  | 'INFO'
  | 'ALERT'
  | 'MEMBERSHIP_REQUEST'
  | 'COMMUNITY_STATUS'
  | 'SYSTEM';

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead?: boolean;
  readAt?: Date | null;
  createdAt?: Date;
}

/**
 * Entité Métier Pure : Notification
 * Représente une notification in-app adressée à un utilisateur spécifique.
 * Respect strict de l'architecture hexagonale : 0 dépendance envers NestJS, Prisma ou tiers.
 */
export class NotificationEntity {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _type: NotificationType;
  private readonly _title: string;
  private readonly _message: string;
  private readonly _data: Record<string, unknown> | null;
  private _isRead: boolean;
  private _readAt: Date | null;
  private readonly _createdAt: Date;

  private constructor(props: {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._type = props.type;
    this._title = props.title;
    this._message = props.message;
    this._data = props.data;
    this._isRead = props.isRead;
    this._readAt = props.readAt;
    this._createdAt = props.createdAt;
  }

  public static create(props: NotificationProps): NotificationEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de la notification est obligatoire.");
    }

    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("L'identifiant du destinataire (userId) est obligatoire.");
    }

    const validTypes: NotificationType[] = [
      'INFO',
      'ALERT',
      'MEMBERSHIP_REQUEST',
      'COMMUNITY_STATUS',
      'SYSTEM',
    ];
    if (!validTypes.includes(props.type)) {
      throw new Error(`Type de notification invalide: ${props.type}`);
    }

    const trimmedTitle = props.title?.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      throw new Error('Le titre de la notification est obligatoire.');
    }
    if (trimmedTitle.length > 150) {
      throw new Error('Le titre de la notification ne peut pas dépasser 150 caractères.');
    }

    const trimmedMessage = props.message?.trim();
    if (!trimmedMessage || trimmedMessage.length === 0) {
      throw new Error('Le message de la notification est obligatoire.');
    }

    return new NotificationEntity({
      id: props.id,
      userId: props.userId,
      type: props.type,
      title: trimmedTitle,
      message: trimmedMessage,
      data: props.data ?? null,
      isRead: props.isRead ?? false,
      readAt: props.readAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public markAsRead(at: Date = new Date()): void {
    if (!this._isRead) {
      this._isRead = true;
      this._readAt = at;
    }
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get type(): NotificationType {
    return this._type;
  }

  public get title(): string {
    return this._title;
  }

  public get message(): string {
    return this._message;
  }

  public get data(): Record<string, unknown> | null {
    return this._data;
  }

  public get isRead(): boolean {
    return this._isRead;
  }

  public get readAt(): Date | null {
    return this._readAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}

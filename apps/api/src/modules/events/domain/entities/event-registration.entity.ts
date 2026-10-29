export type EventRegistrationStatus = 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';

export interface EventRegistrationProps {
  id: string;
  eventId: string;
  userId: string;
  status?: EventRegistrationStatus;
  registeredAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Inscription à un Événement (EventRegistrationEntity)
 * Conforme SOLID :
 * - SRP : Encapsule l'inscription citoyenne à un événement communautaire.
 */
export class EventRegistrationEntity {
  private constructor(
    private readonly _id: string,
    private readonly _eventId: string,
    private readonly _userId: string,
    private _status: EventRegistrationStatus,
    private readonly _registeredAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: EventRegistrationProps): EventRegistrationEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de l'inscription est obligatoire.");
    }
    if (!props.eventId || props.eventId.trim().length === 0) {
      throw new Error("L'identifiant de l'événement est obligatoire.");
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("L'identifiant du citoyen est obligatoire.");
    }

    const now = new Date();
    return new EventRegistrationEntity(
      props.id.trim(),
      props.eventId.trim(),
      props.userId.trim(),
      props.status ?? 'CONFIRMED',
      props.registeredAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get id(): string { return this._id; }
  get eventId(): string { return this._eventId; }
  get userId(): string { return this._userId; }
  get status(): EventRegistrationStatus { return this._status; }
  get registeredAt(): Date { return this._registeredAt; }
  get updatedAt(): Date { return this._updatedAt; }

  public cancel(): void {
    if (this._status === 'CANCELLED') {
      throw new Error("Cette inscription est déjà annulée.");
    }
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
  }
}

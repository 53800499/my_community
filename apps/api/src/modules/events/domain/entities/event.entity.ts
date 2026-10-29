export type EventStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventEntityProps {
  id: string;
  communityId: string;
  organizerUserId: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  maxAttendees?: number | null;
  status?: EventStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Événement Citoyen (EventEntity)
 * Conforme SOLID :
 * - SRP : Encapsule les invariants temporels et de capacité d'un rassemblement communautaire.
 * - Invariants stricts : validation des dates (startsAt < endsAt), titres et localisation non vides.
 */
export class EventEntity {
  private constructor(
    private readonly _id: string,
    private readonly _communityId: string,
    private readonly _organizerUserId: string,
    private _title: string,
    private _description: string,
    private _location: string,
    private _startsAt: Date,
    private _endsAt: Date,
    private _maxAttendees: number | null,
    private _status: EventStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: EventEntityProps): EventEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de l'événement est obligatoire.");
    }
    if (!props.communityId || props.communityId.trim().length === 0) {
      throw new Error("L'identifiant de la communauté est obligatoire.");
    }
    if (!props.organizerUserId || props.organizerUserId.trim().length === 0) {
      throw new Error("L'identifiant de l'organisateur est obligatoire.");
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Le titre de l'événement est obligatoire.");
    }
    if (props.title.trim().length > 200) {
      throw new Error("Le titre de l'événement ne doit pas dépasser 200 caractères.");
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new Error("La description de l'événement est obligatoire.");
    }
    if (!props.location || props.location.trim().length === 0) {
      throw new Error("Le lieu de l'événement est obligatoire.");
    }
    if (!(props.startsAt instanceof Date) || isNaN(props.startsAt.getTime())) {
      throw new Error("La date de début de l'événement est invalide.");
    }
    if (!(props.endsAt instanceof Date) || isNaN(props.endsAt.getTime())) {
      throw new Error("La date de fin de l'événement est invalide.");
    }
    if (props.startsAt.getTime() >= props.endsAt.getTime()) {
      throw new Error("La date de fin doit être strictement postérieure à la date de début.");
    }
    if (props.maxAttendees !== undefined && props.maxAttendees !== null && props.maxAttendees <= 0) {
      throw new Error("La capacité maximale doit être strictement supérieure à 0.");
    }

    const now = new Date();
    return new EventEntity(
      props.id.trim(),
      props.communityId.trim(),
      props.organizerUserId.trim(),
      props.title.trim(),
      props.description.trim(),
      props.location.trim(),
      props.startsAt,
      props.endsAt,
      props.maxAttendees ?? null,
      props.status ?? 'SCHEDULED',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  get id(): string { return this._id; }
  get communityId(): string { return this._communityId; }
  get organizerUserId(): string { return this._organizerUserId; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get location(): string { return this._location; }
  get startsAt(): Date { return this._startsAt; }
  get endsAt(): Date { return this._endsAt; }
  get maxAttendees(): number | null { return this._maxAttendees; }
  get status(): EventStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  public isFull(currentAttendeesCount: number): boolean {
    if (this._maxAttendees === null) return false;
    return currentAttendeesCount >= this._maxAttendees;
  }

  public cancel(requesterUserId: string, isPrivileged: boolean = false): void {
    if (this._status === 'CANCELLED') {
      throw new Error("Cet événement est déjà annulé.");
    }
    if (this._status === 'COMPLETED') {
      throw new Error("Impossible d'annuler un événement déjà terminé.");
    }
    if (!isPrivileged && requesterUserId !== this._organizerUserId) {
      throw new Error("Seul l'organisateur ou un responsable peut annuler cet événement.");
    }
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
  }

  public complete(): void {
    if (this._status === 'CANCELLED') {
      throw new Error("Impossible de marquer terminé un événement annulé.");
    }
    this._status = 'COMPLETED';
    this._updatedAt = new Date();
  }
}

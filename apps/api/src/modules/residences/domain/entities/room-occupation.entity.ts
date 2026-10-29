export type OccupationStatusValue = 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'CANCELLED';

export interface RoomOccupationProps {
  id?: string;
  roomId: string;
  occupantUserId: string;
  associationId: string;
  startDate: Date;
  endDate?: Date | null;
  isActive?: boolean;
  status?: OccupationStatusValue;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoomOccupationEntity {
  private constructor(
    private readonly _id: string,
    private readonly _roomId: string,
    private readonly _occupantUserId: string,
    private readonly _associationId: string,
    private readonly _startDate: Date,
    private _endDate: Date | null,
    private _isActive: boolean,
    private _status: OccupationStatusValue,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: RoomOccupationProps): RoomOccupationEntity {
    if (!props.roomId || props.roomId.trim() === '') {
      throw new Error("L'identifiant de la chambre est obligatoire.");
    }
    if (!props.occupantUserId || props.occupantUserId.trim() === '') {
      throw new Error("L'identifiant de l'occupant est obligatoire.");
    }
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }
    if (!props.startDate || isNaN(props.startDate.getTime())) {
      throw new Error('La date de début de séjour est invalide ou manquante.');
    }
    if (props.endDate && props.endDate.getTime() < props.startDate.getTime()) {
      throw new Error('La date de fin ne peut pas précéder la date de début.');
    }

    const now = new Date();
    return new RoomOccupationEntity(
      props.id ?? crypto.randomUUID(),
      props.roomId,
      props.occupantUserId,
      props.associationId,
      props.startDate,
      props.endDate ?? null,
      props.isActive ?? true,
      props.status ?? 'ACTIVE',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get roomId(): string {
    return this._roomId;
  }

  public get occupantUserId(): string {
    return this._occupantUserId;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get status(): OccupationStatusValue {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public terminate(endDate?: Date): void {
    const end = endDate ?? new Date();
    if (end.getTime() < this._startDate.getTime()) {
      throw new Error('La date de résiliation ne peut pas précéder la date d’entrée.');
    }
    this._endDate = end;
    this._isActive = false;
    this._status = 'TERMINATED';
    this._updatedAt = new Date();
  }

  public cancel(): void {
    this._isActive = false;
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
  }
}

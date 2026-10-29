export type RoomStatusValue = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface RoomProps {
  id?: string;
  buildingId: string;
  roomNumber: string;
  capacity?: number;
  status?: RoomStatusValue;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoomEntity {
  private constructor(
    private readonly _id: string,
    private readonly _buildingId: string,
    private _roomNumber: string,
    private _capacity: number,
    private _status: RoomStatusValue,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: RoomProps): RoomEntity {
    if (!props.buildingId || props.buildingId.trim() === '') {
      throw new Error("L'identifiant du bâtiment est obligatoire.");
    }
    if (!props.roomNumber || props.roomNumber.trim() === '') {
      throw new Error('Le numéro ou nom de chambre est obligatoire.');
    }
    const cap = props.capacity ?? 1;
    if (cap < 1) {
      throw new Error('La capacité d’une chambre doit être strictement supérieure à 0.');
    }

    const now = new Date();
    return new RoomEntity(
      props.id ?? crypto.randomUUID(),
      props.buildingId,
      props.roomNumber.trim(),
      cap,
      props.status ?? 'AVAILABLE',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get buildingId(): string {
    return this._buildingId;
  }

  public get roomNumber(): string {
    return this._roomNumber;
  }

  public get capacity(): number {
    return this._capacity;
  }

  public get status(): RoomStatusValue {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public markOccupied(): void {
    this._status = 'OCCUPIED';
    this._updatedAt = new Date();
  }

  public markAvailable(): void {
    this._status = 'AVAILABLE';
    this._updatedAt = new Date();
  }

  public markMaintenance(): void {
    this._status = 'MAINTENANCE';
    this._updatedAt = new Date();
  }

  public updateDetails(props: { roomNumber?: string; capacity?: number }): void {
    if (props.roomNumber !== undefined) {
      if (!props.roomNumber || props.roomNumber.trim() === '') {
        throw new Error('Le numéro ou nom de chambre est obligatoire.');
      }
      this._roomNumber = props.roomNumber.trim();
    }
    if (props.capacity !== undefined) {
      if (props.capacity < 1) {
        throw new Error('La capacité d’une chambre doit être strictement supérieure à 0.');
      }
      this._capacity = props.capacity;
    }
    this._updatedAt = new Date();
  }
}


export interface BuildingLeaseProps {
  id?: string;
  buildingId: string;
  associationId: string;
  monthlyRentAmount: number;
  currency?: string;
  paymentDayOfMonth?: number;
  leaseStartDate: Date;
  leaseEndDate?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BuildingLeaseEntity {
  private constructor(
    private readonly _id: string,
    private readonly _buildingId: string,
    private readonly _associationId: string,
    private _monthlyRentAmount: number,
    private readonly _currency: string,
    private _paymentDayOfMonth: number,
    private _leaseStartDate: Date,
    private _leaseEndDate: Date | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: BuildingLeaseProps): BuildingLeaseEntity {
    if (!props.buildingId || props.buildingId.trim() === '') {
      throw new Error("L'identifiant du bâtiment est obligatoire pour le bail.");
    }
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire pour le bail.");
    }
    if (!props.monthlyRentAmount || props.monthlyRentAmount <= 0) {
      throw new Error('Le montant du loyer mensuel doit être supérieur à zéro.');
    }
    const day = props.paymentDayOfMonth ?? 5;
    if (day < 1 || day > 28) {
      throw new Error("Le jour d'échéance de paiement du loyer doit être compris entre le 1er et le 28 du mois.");
    }
    if (!props.leaseStartDate) {
      throw new Error('La date de début du bail est obligatoire.');
    }

    const now = new Date();
    return new BuildingLeaseEntity(
      props.id ?? crypto.randomUUID(),
      props.buildingId,
      props.associationId,
      props.monthlyRentAmount,
      props.currency ?? 'XOF',
      day,
      props.leaseStartDate,
      props.leaseEndDate ?? null,
      props.isActive ?? true,
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

  public get associationId(): string {
    return this._associationId;
  }

  public get monthlyRentAmount(): number {
    return this._monthlyRentAmount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get paymentDayOfMonth(): number {
    return this._paymentDayOfMonth;
  }

  public get leaseStartDate(): Date {
    return this._leaseStartDate;
  }

  public get leaseEndDate(): Date | null {
    return this._leaseEndDate;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateRent(newAmount: number, paymentDay?: number): void {
    if (newAmount <= 0) {
      throw new Error('Le montant du loyer mensuel doit être supérieur à zéro.');
    }
    this._monthlyRentAmount = newAmount;
    if (paymentDay !== undefined) {
      if (paymentDay < 1 || paymentDay > 28) {
        throw new Error('Le jour de paiement doit être compris entre 1 et 28.');
      }
      this._paymentDayOfMonth = paymentDay;
    }
    this._updatedAt = new Date();
  }

  public terminateLease(endDate: Date = new Date()): void {
    this._isActive = false;
    this._leaseEndDate = endDate;
    this._updatedAt = new Date();
  }
}

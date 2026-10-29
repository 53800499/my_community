export interface BuildingRentExpenseProps {
  id?: string;
  leaseId: string;
  monthYear: string; // 'YYYY-MM'
  amount: number;
  status?: string; // PENDING, PAID, OVERDUE
  transactionId?: string | null;
  dueDate: Date;
  paidAt?: Date | null;
  createdAt?: Date;
}

export class BuildingRentExpenseEntity {
  private constructor(
    private readonly _id: string,
    private readonly _leaseId: string,
    private readonly _monthYear: string,
    private readonly _amount: number,
    private _status: string,
    private _transactionId: string | null,
    private readonly _dueDate: Date,
    private _paidAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  public static create(props: BuildingRentExpenseProps): BuildingRentExpenseEntity {
    if (!props.leaseId || props.leaseId.trim() === '') {
      throw new Error("L'identifiant du bail est obligatoire pour la charge de loyer.");
    }
    if (!props.monthYear || !/^\d{4}-\d{2}$/.test(props.monthYear.trim())) {
      throw new Error('Le mois et année doivent respecter le format YYYY-MM (ex: 2026-10).');
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant du loyer doit être supérieur à zéro.');
    }
    if (!props.dueDate) {
      throw new Error("La date d'échéance du loyer est obligatoire.");
    }

    const now = new Date();
    return new BuildingRentExpenseEntity(
      props.id ?? crypto.randomUUID(),
      props.leaseId,
      props.monthYear.trim(),
      props.amount,
      props.status ?? 'PENDING',
      props.transactionId ?? null,
      props.dueDate,
      props.paidAt ?? null,
      props.createdAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get leaseId(): string {
    return this._leaseId;
  }

  public get monthYear(): string {
    return this._monthYear;
  }

  public get amount(): number {
    return this._amount;
  }

  public get status(): string {
    return this._status;
  }

  public get transactionId(): string | null {
    return this._transactionId;
  }

  public get dueDate(): Date {
    return this._dueDate;
  }

  public get paidAt(): Date | null {
    return this._paidAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public markAsPaid(transactionId: string, paidDate: Date = new Date()): void {
    if (this._status === 'PAID') {
      throw new Error('Cette échéance de loyer est déjà payée.');
    }
    this._status = 'PAID';
    this._transactionId = transactionId;
    this._paidAt = paidDate;
  }
}

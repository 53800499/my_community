export interface IntegrationFeeDueProps {
  id?: string;
  occupationId: string;
  userId: string;
  planId: string;
  totalAmount: number;
  paidAmount?: number;
  status?: string; // PENDING, PARTIAL, SETTLED
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class IntegrationFeeDueEntity {
  private constructor(
    private readonly _id: string,
    private readonly _occupationId: string,
    private readonly _userId: string,
    private readonly _planId: string,
    private readonly _totalAmount: number,
    private _paidAmount: number,
    private _status: string,
    private readonly _dueDate: Date,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: IntegrationFeeDueProps): IntegrationFeeDueEntity {
    if (!props.occupationId || props.occupationId.trim() === '') {
      throw new Error("L'identifiant du contrat d'occupation est obligatoire.");
    }
    if (!props.userId || props.userId.trim() === '') {
      throw new Error("L'identifiant de l'étudiant est obligatoire.");
    }
    if (!props.planId || props.planId.trim() === '') {
      throw new Error("L'identifiant du barème est obligatoire.");
    }
    if (!props.totalAmount || props.totalAmount <= 0) {
      throw new Error('Le montant total dû doit être supérieur à zéro.');
    }
    const paid = props.paidAmount ?? 0;
    if (paid < 0) {
      throw new Error('Le montant déjà réglé ne peut être négatif.');
    }
    if (paid > props.totalAmount) {
      throw new Error('Le montant réglé ne peut dépasser le montant total exigé.');
    }

    let status = props.status ?? 'PENDING';
    if (!props.status) {
      if (paid === props.totalAmount) status = 'SETTLED';
      else if (paid > 0) status = 'PARTIAL';
      else status = 'PENDING';
    }

    const now = new Date();
    return new IntegrationFeeDueEntity(
      props.id ?? crypto.randomUUID(),
      props.occupationId,
      props.userId,
      props.planId,
      props.totalAmount,
      paid,
      status,
      props.dueDate,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get occupationId(): string {
    return this._occupationId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get planId(): string {
    return this._planId;
  }

  public get totalAmount(): number {
    return this._totalAmount;
  }

  public get paidAmount(): number {
    return this._paidAmount;
  }

  public get remainingAmount(): number {
    return Math.max(0, this._totalAmount - this._paidAmount);
  }

  public get status(): string {
    return this._status;
  }

  public get dueDate(): Date {
    return this._dueDate;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public recordPayment(amount: number): void {
    if (amount <= 0) {
      throw new Error('Le montant du versement doit être supérieur à zéro.');
    }
    if (this._paidAmount + amount > this._totalAmount) {
      throw new Error(
        `Le versement (${amount} XOF) dépasse le reste à payer (${this.remainingAmount} XOF).`,
      );
    }

    this._paidAmount += amount;
    this._status = this._paidAmount >= this._totalAmount ? 'SETTLED' : 'PARTIAL';
    this._updatedAt = new Date();
  }
}

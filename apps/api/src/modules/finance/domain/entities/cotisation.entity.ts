export interface CotisationProps {
  id?: string;
  associationId: string;
  memberId: string;
  amount: number;
  currency?: string;
  period: string; // e.g. "2026-10"
  status?: string; // PAID, PENDING, OVERDUE
  paymentMethod?: string; // MOBILE_MONEY, CASH, BANK_TRANSFER
  reference?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  paidAt?: Date;
  createdAt?: Date;
}

export class CotisationEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string,
    private readonly _memberId: string,
    private readonly _amount: number,
    private readonly _currency: string,
    private readonly _period: string,
    private _status: string,
    private readonly _paymentMethod: string,
    private readonly _reference: string | null,
    private _transactionId: string | null,
    private _notes: string | null,
    private readonly _paidAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(props: CotisationProps): CotisationEntity {
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }
    if (!props.memberId || props.memberId.trim() === '') {
      throw new Error("L'identifiant du membre est obligatoire.");
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant de la cotisation doit être supérieur à zéro.');
    }
    if (!props.period || props.period.trim() === '') {
      throw new Error('La période de cotisation est obligatoire (ex: 2026-10).');
    }

    const now = new Date();
    const reference = props.reference?.trim() || `COT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return new CotisationEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId,
      props.memberId,
      props.amount,
      props.currency ?? 'XOF',
      props.period.trim(),
      props.status ?? 'PAID',
      props.paymentMethod ?? 'MOBILE_MONEY',
      reference,
      props.transactionId ?? null,
      props.notes?.trim() ?? null,
      props.paidAt ?? now,
      props.createdAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get memberId(): string {
    return this._memberId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get period(): string {
    return this._period;
  }

  public get status(): string {
    return this._status;
  }

  public get paymentMethod(): string {
    return this._paymentMethod;
  }

  public get reference(): string | null {
    return this._reference;
  }

  public get transactionId(): string | null {
    return this._transactionId;
  }

  public get notes(): string | null {
    return this._notes;
  }

  public get paidAt(): Date {
    return this._paidAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public linkTransaction(transactionId: string): void {
    this._transactionId = transactionId;
  }
}

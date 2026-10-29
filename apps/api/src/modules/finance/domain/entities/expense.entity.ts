export type ExpenseStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface ExpenseProps {
  id?: string;
  associationId: string;
  title: string;
  category: string; // LOGISTIQUE, LOYER_BAILLEUR, EVENEMENT, EQUIPEMENT, AIDE_SOCIALE, AUTRE
  amount: number;
  currency?: string;
  beneficiary: string;
  paymentMethod?: string; // MOBILE_MONEY, BANK_TRANSFER, CASH
  status?: ExpenseStatus;
  receiptRef?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  expenseDate?: Date;
  recordedById: string;
  createdAt?: Date;
}

export class ExpenseEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string,
    private _title: string,
    private _category: string,
    private _amount: number,
    private readonly _currency: string,
    private _beneficiary: string,
    private _paymentMethod: string,
    private _status: ExpenseStatus,
    private _receiptRef: string | null,
    private _transactionId: string | null,
    private _notes: string | null,
    private readonly _expenseDate: Date,
    private readonly _recordedById: string,
    private readonly _createdAt: Date,
  ) {}

  public static create(props: ExpenseProps): ExpenseEntity {
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire pour la dépense.");
    }
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('L’intitulé de la dépense doit comporter au moins 3 caractères.');
    }
    if (!props.beneficiary || props.beneficiary.trim() === '') {
      throw new Error('Le bénéficiaire ou prestataire est obligatoire.');
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant de la dépense doit être supérieur à zéro.');
    }
    if (!props.recordedById || props.recordedById.trim() === '') {
      throw new Error("L'identifiant de l'auteur de l'enregistrement est obligatoire.");
    }

    const now = new Date();
    return new ExpenseEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId,
      props.title.trim(),
      props.category.trim(),
      props.amount,
      props.currency ?? 'XOF',
      props.beneficiary.trim(),
      props.paymentMethod ?? 'MOBILE_MONEY',
      props.status ?? 'PAID',
      props.receiptRef?.trim() ?? null,
      props.transactionId ?? null,
      props.notes?.trim() ?? null,
      props.expenseDate ?? now,
      props.recordedById,
      props.createdAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get title(): string {
    return this._title;
  }

  public get category(): string {
    return this._category;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get beneficiary(): string {
    return this._beneficiary;
  }

  public get paymentMethod(): string {
    return this._paymentMethod;
  }

  public get status(): ExpenseStatus {
    return this._status;
  }

  public get receiptRef(): string | null {
    return this._receiptRef;
  }

  public get transactionId(): string | null {
    return this._transactionId;
  }

  public get notes(): string | null {
    return this._notes;
  }

  public get expenseDate(): Date {
    return this._expenseDate;
  }

  public get recordedById(): string {
    return this._recordedById;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public approve(transactionId: string): void {
    this._status = 'PAID';
    this._transactionId = transactionId;
  }

  public reject(): void {
    this._status = 'REJECTED';
  }
}

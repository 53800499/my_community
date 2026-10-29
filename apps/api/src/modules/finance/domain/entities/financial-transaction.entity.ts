export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED';

export interface FinancialTransactionProps {
  id?: string;
  associationId?: string | null;
  amount: number;
  currency?: string;
  type: TransactionType;
  status?: TransactionStatus;
  reference?: string | null;
  description?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  recordedById: string;
  createdAt?: Date;
}

export class FinancialTransactionEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string | null,
    private readonly _amount: number,
    private readonly _currency: string,
    private readonly _type: TransactionType,
    private readonly _status: TransactionStatus,
    private readonly _reference: string | null,
    private readonly _description: string | null,
    private readonly _category: string | null,
    private readonly _paymentMethod: string | null,
    private readonly _recordedById: string,
    private readonly _createdAt: Date,
  ) {}

  public static create(props: FinancialTransactionProps): FinancialTransactionEntity {
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant de la transaction doit être supérieur à zéro.');
    }
    if (!props.recordedById || props.recordedById.trim() === '') {
      throw new Error("L'identifiant de l'auteur de l'enregistrement est obligatoire.");
    }

    const now = new Date();
    const reference = props.reference?.trim() || `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return new FinancialTransactionEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId ?? null,
      props.amount,
      props.currency ?? 'XOF',
      props.type,
      props.status ?? 'POSTED',
      reference,
      props.description?.trim() ?? null,
      props.category?.trim() ?? null,
      props.paymentMethod?.trim() ?? null,
      props.recordedById,
      props.createdAt ?? now,
    );
  }

  public static createAdjustment(
    originalTx: FinancialTransactionEntity,
    adjustmentAmount: number,
    reason: string,
    recordedById: string,
  ): FinancialTransactionEntity {
    if (!reason || reason.trim().length < 5) {
      throw new Error("Le motif de l'ajustement doit comporter au moins 5 caractères.");
    }
    if (adjustmentAmount <= 0) {
      throw new Error("Le montant de l'ajustement doit être supérieur à zéro.");
    }

    return FinancialTransactionEntity.create({
      associationId: originalTx.associationId,
      amount: adjustmentAmount,
      currency: originalTx.currency,
      type: 'ADJUSTMENT',
      status: 'POSTED',
      reference: `ADJ-${originalTx.reference ?? originalTx.id.slice(0, 8)}`,
      description: `Ajustement de la transaction ${originalTx.reference ?? originalTx.id} : ${reason.trim()}`,
      category: originalTx.category ?? 'AJUSTEMENT',
      paymentMethod: originalTx.paymentMethod,
      recordedById,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string | null {
    return this._associationId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get type(): TransactionType {
    return this._type;
  }

  public get status(): TransactionStatus {
    return this._status;
  }

  public get reference(): string | null {
    return this._reference;
  }

  public get description(): string | null {
    return this._description;
  }

  public get category(): string | null {
    return this._category;
  }

  public get paymentMethod(): string | null {
    return this._paymentMethod;
  }

  public get recordedById(): string {
    return this._recordedById;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}

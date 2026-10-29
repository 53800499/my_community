export interface IntegrationFeePaymentProps {
  id?: string;
  dueId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string; // CASH, MOBILE_MONEY, BANK_TRANSFER
  receiptReference?: string;
  recordedById: string;
  paidAt?: Date;
}

export class IntegrationFeePaymentEntity {
  private constructor(
    private readonly _id: string,
    private readonly _dueId: string,
    private readonly _transactionId: string,
    private readonly _amount: number,
    private readonly _paymentMethod: string,
    private readonly _receiptReference: string,
    private readonly _recordedById: string,
    private readonly _paidAt: Date,
  ) {}

  public static create(props: IntegrationFeePaymentProps): IntegrationFeePaymentEntity {
    if (!props.dueId || props.dueId.trim() === '') {
      throw new Error("L'identifiant de la créance d'intégration est obligatoire.");
    }
    if (!props.transactionId || props.transactionId.trim() === '') {
      throw new Error("L'identifiant de la transaction financière liée est obligatoire.");
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant du versement doit être supérieur à zéro.');
    }
    if (!props.recordedById || props.recordedById.trim() === '') {
      throw new Error("L'identifiant de l'agent trésorier enregistreur est obligatoire.");
    }

    const now = new Date();
    const receiptRef =
      props.receiptReference?.trim() ||
      `REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    return new IntegrationFeePaymentEntity(
      props.id ?? crypto.randomUUID(),
      props.dueId,
      props.transactionId,
      props.amount,
      props.paymentMethod ?? 'MOBILE_MONEY',
      receiptRef,
      props.recordedById,
      props.paidAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get dueId(): string {
    return this._dueId;
  }

  public get transactionId(): string {
    return this._transactionId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get paymentMethod(): string {
    return this._paymentMethod;
  }

  public get receiptReference(): string {
    return this._receiptReference;
  }

  public get recordedById(): string {
    return this._recordedById;
  }

  public get paidAt(): Date {
    return this._paidAt;
  }
}

export interface DonationProps {
  id?: string;
  associationId: string;
  donorName: string;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  paymentMethod?: string; // MOBILE_MONEY, BANK_TRANSFER, CASH
  campaignName?: string | null;
  reference?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  receivedAt?: Date;
  createdAt?: Date;
}

export class DonationEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string,
    private readonly _donorName: string,
    private readonly _donorEmail: string | null,
    private readonly _donorPhone: string | null,
    private readonly _amount: number,
    private readonly _currency: string,
    private readonly _paymentMethod: string,
    private readonly _campaignName: string | null,
    private readonly _reference: string,
    private _transactionId: string | null,
    private readonly _notes: string | null,
    private readonly _receivedAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(props: DonationProps): DonationEntity {
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire pour le don.");
    }
    if (!props.donorName || props.donorName.trim().length < 2) {
      throw new Error('Le nom du donateur doit comporter au moins 2 caractères.');
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant du don doit être supérieur à zéro.');
    }

    const now = new Date();
    const reference = props.reference?.trim() || `DON-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return new DonationEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId,
      props.donorName.trim(),
      props.donorEmail?.trim() ?? null,
      props.donorPhone?.trim() ?? null,
      props.amount,
      props.currency ?? 'XOF',
      props.paymentMethod ?? 'MOBILE_MONEY',
      props.campaignName?.trim() ?? null,
      reference,
      props.transactionId ?? null,
      props.notes?.trim() ?? null,
      props.receivedAt ?? now,
      props.createdAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get donorName(): string {
    return this._donorName;
  }

  public get donorEmail(): string | null {
    return this._donorEmail;
  }

  public get donorPhone(): string | null {
    return this._donorPhone;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get paymentMethod(): string {
    return this._paymentMethod;
  }

  public get campaignName(): string | null {
    return this._campaignName;
  }

  public get reference(): string {
    return this._reference;
  }

  public get transactionId(): string | null {
    return this._transactionId;
  }

  public get notes(): string | null {
    return this._notes;
  }

  public get receivedAt(): Date {
    return this._receivedAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public linkTransaction(transactionId: string): void {
    this._transactionId = transactionId;
  }
}

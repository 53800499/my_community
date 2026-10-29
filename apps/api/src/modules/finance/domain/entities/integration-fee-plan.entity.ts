export interface IntegrationFeePlanProps {
  id?: string;
  associationId: string;
  academicYear: string; // '2026-2027'
  name: string;
  amount: number;
  currency?: string;
  installmentsAllowed?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class IntegrationFeePlanEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string,
    private readonly _academicYear: string,
    private _name: string,
    private _amount: number,
    private readonly _currency: string,
    private _installmentsAllowed: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: IntegrationFeePlanProps): IntegrationFeePlanEntity {
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire pour le barème.");
    }
    if (!props.academicYear || props.academicYear.trim() === '') {
      throw new Error("L'année universitaire est obligatoire (ex: 2026-2027).");
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Le nom du barème doit comporter au moins 2 caractères.');
    }
    if (!props.amount || props.amount <= 0) {
      throw new Error('Le montant des frais d’intégration doit être supérieur à zéro.');
    }
    const installments = props.installmentsAllowed ?? 2;
    if (installments < 1) {
      throw new Error('Le nombre de tranches autorisées doit être au moins 1.');
    }

    const now = new Date();
    return new IntegrationFeePlanEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId,
      props.academicYear.trim(),
      props.name.trim(),
      props.amount,
      props.currency ?? 'XOF',
      installments,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get academicYear(): string {
    return this._academicYear;
  }

  public get name(): string {
    return this._name;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get installmentsAllowed(): number {
    return this._installmentsAllowed;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updatePlan(name?: string, amount?: number, installments?: number): void {
    if (name) this._name = name.trim();
    if (amount !== undefined) {
      if (amount <= 0) throw new Error('Le montant doit être supérieur à zéro.');
      this._amount = amount;
    }
    if (installments !== undefined) {
      if (installments < 1) throw new Error('Les tranches doivent être >= 1.');
      this._installmentsAllowed = installments;
    }
    this._updatedAt = new Date();
  }
}

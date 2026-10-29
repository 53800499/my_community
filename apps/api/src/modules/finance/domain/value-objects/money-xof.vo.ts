export class MoneyXOF {
  private constructor(private readonly _amount: number) {
    if (isNaN(_amount) || _amount < 0) {
      throw new Error('Le montant en XOF doit être un nombre positif ou nul.');
    }
  }

  public static of(amount: number): MoneyXOF {
    return new MoneyXOF(amount);
  }

  public get amount(): number {
    return this._amount;
  }

  public add(other: MoneyXOF): MoneyXOF {
    return new MoneyXOF(this._amount + other.amount);
  }

  public subtract(other: MoneyXOF): MoneyXOF {
    if (this._amount < other.amount) {
      throw new Error('Solde insuffisant pour déduire ce montant.');
    }
    return new MoneyXOF(this._amount - other.amount);
  }

  public format(): string {
    return `${new Intl.NumberFormat('fr-FR').format(this._amount)} FCFA`;
  }
}

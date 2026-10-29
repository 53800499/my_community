import type { FinancialTransactionEntity } from '../entities/financial-transaction.entity.js';

export class FinancialImmutabilityPolicy {
  public static canBeModified(transaction: FinancialTransactionEntity): boolean {
    return transaction.status === 'PENDING';
  }

  public static assertCanBeAdjusted(transaction: FinancialTransactionEntity): void {
    if (transaction.status !== 'POSTED') {
      throw new Error(
        `Seules les transactions confirmées (POSTED) peuvent faire l'objet d'un ajustement. Statut actuel: ${transaction.status}`,
      );
    }
  }

  public static assertCannotBeDeleted(transaction: FinancialTransactionEntity): void {
    if (transaction.status === 'POSTED') {
      throw new Error(
        "Conformément à l'ADR-006, une transaction confirmée ('POSTED') ne peut être supprimée. Utilisez une transaction compensatrice d'ajustement (ADJUSTMENT).",
      );
    }
  }
}

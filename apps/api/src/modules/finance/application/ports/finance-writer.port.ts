import type { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import type { CotisationEntity } from '../../domain/entities/cotisation.entity.js';
import type { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';
import type { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';
import type { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';
import type { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';
import type { IntegrationFeePaymentEntity } from '../../domain/entities/integration-fee-payment.entity.js';
import type { DonationEntity } from '../../domain/entities/donation.entity.js';
import type { ExpenseEntity } from '../../domain/entities/expense.entity.js';

export const FINANCE_WRITER_PORT = Symbol('FINANCE_WRITER_PORT');

export interface FinanceWriterPort {
  saveTransaction(transaction: FinancialTransactionEntity): Promise<void>;
  saveCotisation(cotisation: CotisationEntity): Promise<void>;
  saveBuildingLease(lease: BuildingLeaseEntity): Promise<void>;
  saveRentExpense(rentExpense: BuildingRentExpenseEntity): Promise<void>;
  saveIntegrationFeePlan(plan: IntegrationFeePlanEntity): Promise<void>;
  saveIntegrationFeeDue(due: IntegrationFeeDueEntity): Promise<void>;
  saveIntegrationFeePayment(payment: IntegrationFeePaymentEntity): Promise<void>;
  saveDonation(donation: DonationEntity): Promise<void>;
  saveExpense(expense: ExpenseEntity): Promise<void>;
}

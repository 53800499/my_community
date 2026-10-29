import type { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import type { CotisationEntity } from '../../domain/entities/cotisation.entity.js';
import type { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';
import type { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';
import type { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';
import type { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';
import type { DonationEntity } from '../../domain/entities/donation.entity.js';
import type { ExpenseEntity } from '../../domain/entities/expense.entity.js';

export const FINANCE_READER_PORT = Symbol('FINANCE_READER_PORT');

export interface ListTransactionsFilter {
  associationId?: string;
  type?: string;
  status?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListCotisationsFilter {
  associationId?: string;
  memberId?: string;
  period?: string;
  status?: string;
}

export interface ListRentExpensesFilter {
  leaseId?: string;
  monthYear?: string;
  status?: string;
}

export interface ListIntegrationFeeDuesFilter {
  userId?: string;
  planId?: string;
  status?: string;
}

export interface ListDonationsFilter {
  associationId?: string;
  campaignName?: string;
  paymentMethod?: string;
}

export interface ListExpensesFilter {
  associationId?: string;
  category?: string;
  status?: string;
}

export interface FinanceStats {
  totalIncomeXOF: number;
  totalExpenseXOF: number;
  netBalanceXOF: number;
  totalCotisationsXOF: number;
  totalDonationsXOF: number;
  totalIntegrationFeesXOF: number;
  totalLandlordRentsXOF: number;
  pendingIntegrationDuesXOF: number;
  pendingBuildingRentXOF: number;
  transactionsCount: number;
  expensesByCategory: Record<string, number>;
  monthlyBreakdown: Array<{ month: string; income: number; expense: number }>;
}

export interface IntegrationFeeDebtorSummary {
  dueId: string;
  userId: string;
  userName: string;
  userPhone: string;
  roomNumber: string;
  buildingName: string;
  quarterName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate: Date;
}

export interface FinanceReaderPort {
  // Transactions
  findTransactionById(id: string): Promise<FinancialTransactionEntity | null>;
  findTransactionByReference(reference: string): Promise<FinancialTransactionEntity | null>;
  listTransactions(filter?: ListTransactionsFilter): Promise<FinancialTransactionEntity[]>;

  // Cotisations
  findCotisationById(id: string): Promise<CotisationEntity | null>;
  listCotisations(filter?: ListCotisationsFilter): Promise<CotisationEntity[]>;

  // Building Leases & Rents
  findBuildingLeaseById(id: string): Promise<BuildingLeaseEntity | null>;
  findBuildingLeaseByBuildingId(buildingId: string): Promise<BuildingLeaseEntity | null>;
  listBuildingLeases(associationId?: string): Promise<BuildingLeaseEntity[]>;

  findRentExpenseById(id: string): Promise<BuildingRentExpenseEntity | null>;
  listRentExpenses(filter?: ListRentExpensesFilter): Promise<BuildingRentExpenseEntity[]>;

  // Integration Fees
  findIntegrationFeePlanById(id: string): Promise<IntegrationFeePlanEntity | null>;
  findIntegrationFeePlanByYear(associationId: string, academicYear: string): Promise<IntegrationFeePlanEntity | null>;
  listIntegrationFeePlans(associationId?: string): Promise<IntegrationFeePlanEntity[]>;

  findIntegrationFeeDueById(id: string): Promise<IntegrationFeeDueEntity | null>;
  findIntegrationFeeDueByOccupationId(occupationId: string): Promise<IntegrationFeeDueEntity | null>;
  listIntegrationFeeDues(filter?: ListIntegrationFeeDuesFilter): Promise<IntegrationFeeDueEntity[]>;
  listIntegrationFeeDebtors(associationId?: string): Promise<IntegrationFeeDebtorSummary[]>;

  // Donations
  findDonationById(id: string): Promise<DonationEntity | null>;
  listDonations(filter?: ListDonationsFilter): Promise<DonationEntity[]>;

  // Expenses
  findExpenseById(id: string): Promise<ExpenseEntity | null>;
  listExpenses(filter?: ListExpensesFilter): Promise<ExpenseEntity[]>;

  // Stats & Balances
  getFinanceStats(associationId?: string): Promise<FinanceStats>;
}

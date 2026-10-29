// Module
export { FinanceModule } from './finance.module.js';

// Domain Entities
export {
  FinancialTransactionEntity,
  type FinancialTransactionProps,
  type TransactionType,
  type TransactionStatus,
} from './domain/entities/financial-transaction.entity.js';
export { CotisationEntity, type CotisationProps } from './domain/entities/cotisation.entity.js';
export { BuildingLeaseEntity, type BuildingLeaseProps } from './domain/entities/building-lease.entity.js';
export { BuildingRentExpenseEntity, type BuildingRentExpenseProps } from './domain/entities/building-rent-expense.entity.js';
export { IntegrationFeePlanEntity, type IntegrationFeePlanProps } from './domain/entities/integration-fee-plan.entity.js';
export { IntegrationFeeDueEntity, type IntegrationFeeDueProps } from './domain/entities/integration-fee-due.entity.js';
export { IntegrationFeePaymentEntity, type IntegrationFeePaymentProps } from './domain/entities/integration-fee-payment.entity.js';
export { DonationEntity, type DonationProps } from './domain/entities/donation.entity.js';
export { ExpenseEntity, type ExpenseProps, type ExpenseStatus } from './domain/entities/expense.entity.js';

// Value Objects & Policies
export { MoneyXOF } from './domain/value-objects/money-xof.vo.js';
export { FinancialImmutabilityPolicy } from './domain/policies/financial-immutability.policy.js';

// Domain Events
export {
  TransactionPostedEvent,
  CotisationRecordedEvent,
  IntegrationFeePaidEvent,
  BuildingRentPaidEvent,
  DonationReceivedEvent,
  ExpenseRecordedEvent,
} from './domain/events/finance.events.js';

// Ports
export {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type FinanceStats,
  type IntegrationFeeDebtorSummary,
  type ListTransactionsFilter,
  type ListCotisationsFilter,
  type ListRentExpensesFilter,
  type ListIntegrationFeeDuesFilter,
  type ListDonationsFilter,
  type ListExpensesFilter,
} from './application/ports/finance-reader.port.js';
export {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from './application/ports/finance-writer.port.js';

// Commands
export {
  RecordTransactionUseCase,
  type RecordTransactionCommand,
} from './application/commands/record-transaction.use-case.js';
export {
  CreateAdjustmentUseCase,
  type CreateAdjustmentCommand,
} from './application/commands/create-adjustment.use-case.js';
export {
  RecordCotisationUseCase,
  type RecordCotisationCommand,
} from './application/commands/record-cotisation.use-case.js';
export {
  CreateBuildingLeaseUseCase,
  type CreateBuildingLeaseCommand,
} from './application/commands/create-building-lease.use-case.js';
export {
  ProcessBuildingRentExpenseUseCase,
  type ProcessBuildingRentExpenseCommand,
} from './application/commands/process-building-rent-expense.use-case.js';
export {
  SettleBuildingRentExpenseUseCase,
  type SettleBuildingRentExpenseCommand,
} from './application/commands/settle-building-rent-expense.use-case.js';
export {
  CreateIntegrationFeePlanUseCase,
  type CreateIntegrationFeePlanCommand,
} from './application/commands/create-integration-fee-plan.use-case.js';
export {
  CallIntegrationFeeDueUseCase,
  type CallIntegrationFeeDueCommand,
} from './application/commands/call-integration-fee-due.use-case.js';
export {
  PayIntegrationFeeUseCase,
  type PayIntegrationFeeCommand,
  type PayIntegrationFeeResult,
} from './application/commands/pay-integration-fee.use-case.js';
export {
  RecordDonationUseCase,
  type RecordDonationCommand,
} from './application/commands/record-donation.use-case.js';
export {
  RecordExpenseUseCase,
  type RecordExpenseCommand,
} from './application/commands/record-expense.use-case.js';
export {
  ApproveExpenseUseCase,
  type ApproveExpenseCommand,
} from './application/commands/approve-expense.use-case.js';

// Queries
export { GetFinanceStatsQuery } from './application/queries/get-finance-stats.query.js';
export {
  ListTransactionsQuery,
  GetTransactionByIdQuery,
} from './application/queries/list-transactions.query.js';
export { ListCotisationsQuery } from './application/queries/list-cotisations.query.js';
export {
  ListBuildingLeasesQuery,
  ListBuildingRentExpensesQuery,
} from './application/queries/list-building-leases.query.js';
export {
  ListIntegrationFeePlansQuery,
  ListIntegrationFeeDuesQuery,
  GetIntegrationFeeDebtorsQuery,
} from './application/queries/list-integration-fees.query.js';
export { ListDonationsQuery } from './application/queries/list-donations.query.js';
export { ListExpensesQuery } from './application/queries/list-expenses.query.js';


import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Ports
import { FINANCE_READER_PORT } from './application/ports/finance-reader.port.js';
import { FINANCE_WRITER_PORT } from './application/ports/finance-writer.port.js';

// Repositories
import { PrismaFinanceRepository } from './infrastructure/repositories/prisma-finance.repository.js';

// Use Cases
import { RecordTransactionUseCase } from './application/commands/record-transaction.use-case.js';
import { CreateAdjustmentUseCase } from './application/commands/create-adjustment.use-case.js';
import { RecordCotisationUseCase } from './application/commands/record-cotisation.use-case.js';
import { CreateBuildingLeaseUseCase } from './application/commands/create-building-lease.use-case.js';
import { ProcessBuildingRentExpenseUseCase } from './application/commands/process-building-rent-expense.use-case.js';
import { SettleBuildingRentExpenseUseCase } from './application/commands/settle-building-rent-expense.use-case.js';
import { CreateIntegrationFeePlanUseCase } from './application/commands/create-integration-fee-plan.use-case.js';
import { CallIntegrationFeeDueUseCase } from './application/commands/call-integration-fee-due.use-case.js';
import { PayIntegrationFeeUseCase } from './application/commands/pay-integration-fee.use-case.js';
import { RecordDonationUseCase } from './application/commands/record-donation.use-case.js';
import { RecordExpenseUseCase } from './application/commands/record-expense.use-case.js';
import { ApproveExpenseUseCase } from './application/commands/approve-expense.use-case.js';

// Queries
import { GetFinanceStatsQuery } from './application/queries/get-finance-stats.query.js';
import { ListTransactionsQuery, GetTransactionByIdQuery } from './application/queries/list-transactions.query.js';
import { ListCotisationsQuery } from './application/queries/list-cotisations.query.js';
import { ListBuildingLeasesQuery, ListBuildingRentExpensesQuery } from './application/queries/list-building-leases.query.js';
import {
  ListIntegrationFeePlansQuery,
  ListIntegrationFeeDuesQuery,
  GetIntegrationFeeDebtorsQuery,
} from './application/queries/list-integration-fees.query.js';
import { ListDonationsQuery } from './application/queries/list-donations.query.js';
import { ListExpensesQuery } from './application/queries/list-expenses.query.js';

// Presentation
import { FinanceController } from './presentation/http/finance.controller.js';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [FinanceController],
  providers: [
    {
      provide: FINANCE_READER_PORT,
      useClass: PrismaFinanceRepository,
    },
    {
      provide: FINANCE_WRITER_PORT,
      useClass: PrismaFinanceRepository,
    },
    RecordTransactionUseCase,
    CreateAdjustmentUseCase,
    RecordCotisationUseCase,
    CreateBuildingLeaseUseCase,
    ProcessBuildingRentExpenseUseCase,
    SettleBuildingRentExpenseUseCase,
    CreateIntegrationFeePlanUseCase,
    CallIntegrationFeeDueUseCase,
    PayIntegrationFeeUseCase,
    RecordDonationUseCase,
    RecordExpenseUseCase,
    ApproveExpenseUseCase,
    GetFinanceStatsQuery,
    ListTransactionsQuery,
    GetTransactionByIdQuery,
    ListCotisationsQuery,
    ListBuildingLeasesQuery,
    ListBuildingRentExpensesQuery,
    ListIntegrationFeePlansQuery,
    ListIntegrationFeeDuesQuery,
    GetIntegrationFeeDebtorsQuery,
    ListDonationsQuery,
    ListExpensesQuery,
  ],
  exports: [
    FINANCE_READER_PORT,
    FINANCE_WRITER_PORT,
    RecordTransactionUseCase,
    CreateAdjustmentUseCase,
    RecordCotisationUseCase,
    CreateBuildingLeaseUseCase,
    ProcessBuildingRentExpenseUseCase,
    SettleBuildingRentExpenseUseCase,
    CreateIntegrationFeePlanUseCase,
    CallIntegrationFeeDueUseCase,
    PayIntegrationFeeUseCase,
    RecordDonationUseCase,
    RecordExpenseUseCase,
    ApproveExpenseUseCase,
    GetFinanceStatsQuery,
    ListTransactionsQuery,
    GetTransactionByIdQuery,
    ListCotisationsQuery,
    ListBuildingLeasesQuery,
    ListBuildingRentExpensesQuery,
    ListIntegrationFeePlansQuery,
    ListIntegrationFeeDuesQuery,
    GetIntegrationFeeDebtorsQuery,
    ListDonationsQuery,
    ListExpensesQuery,
  ],
})
export class FinanceModule {}

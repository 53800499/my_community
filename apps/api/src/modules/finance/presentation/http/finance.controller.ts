import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../identity/domain/entities/user-account.entity.js';

// Use Cases
import { RecordTransactionUseCase } from '../../application/commands/record-transaction.use-case.js';
import { CreateAdjustmentUseCase } from '../../application/commands/create-adjustment.use-case.js';
import { RecordCotisationUseCase } from '../../application/commands/record-cotisation.use-case.js';
import { CreateBuildingLeaseUseCase } from '../../application/commands/create-building-lease.use-case.js';
import { ProcessBuildingRentExpenseUseCase } from '../../application/commands/process-building-rent-expense.use-case.js';
import { SettleBuildingRentExpenseUseCase } from '../../application/commands/settle-building-rent-expense.use-case.js';
import { CreateIntegrationFeePlanUseCase } from '../../application/commands/create-integration-fee-plan.use-case.js';
import { CallIntegrationFeeDueUseCase } from '../../application/commands/call-integration-fee-due.use-case.js';
import { PayIntegrationFeeUseCase } from '../../application/commands/pay-integration-fee.use-case.js';
import { RecordDonationUseCase } from '../../application/commands/record-donation.use-case.js';
import { RecordExpenseUseCase } from '../../application/commands/record-expense.use-case.js';
import { ApproveExpenseUseCase } from '../../application/commands/approve-expense.use-case.js';

// Queries
import { GetFinanceStatsQuery } from '../../application/queries/get-finance-stats.query.js';
import { ListTransactionsQuery, GetTransactionByIdQuery } from '../../application/queries/list-transactions.query.js';
import { ListCotisationsQuery } from '../../application/queries/list-cotisations.query.js';
import { ListBuildingLeasesQuery, ListBuildingRentExpensesQuery } from '../../application/queries/list-building-leases.query.js';
import {
  ListIntegrationFeePlansQuery,
  ListIntegrationFeeDuesQuery,
  GetIntegrationFeeDebtorsQuery,
} from '../../application/queries/list-integration-fees.query.js';
import { ListDonationsQuery } from '../../application/queries/list-donations.query.js';
import { ListExpensesQuery } from '../../application/queries/list-expenses.query.js';

// DTOs
import { CreateTransactionDto, CreateAdjustmentDto } from './dto/create-transaction.dto.js';
import { RecordCotisationDto, CreateBuildingLeaseDto } from './dto/record-cotisation.dto.js';
import { SettleRentExpenseDto, GenerateRentExpenseDto, CreateIntegrationFeePlanDto } from './dto/settle-rent-expense.dto.js';
import { CallIntegrationFeeDueDto, PayIntegrationFeeDto } from './dto/pay-integration-fee.dto.js';
import { RecordDonationDto } from './dto/record-donation.dto.js';
import { RecordExpenseDto, ApproveExpenseDto } from './dto/record-expense.dto.js';

@ApiTags('Finance & Trésorerie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly recordTxUseCase: RecordTransactionUseCase,
    private readonly createAdjustmentUseCase: CreateAdjustmentUseCase,
    private readonly recordCotisationUseCase: RecordCotisationUseCase,
    private readonly createLeaseUseCase: CreateBuildingLeaseUseCase,
    private readonly processRentExpenseUseCase: ProcessBuildingRentExpenseUseCase,
    private readonly settleRentExpenseUseCase: SettleBuildingRentExpenseUseCase,
    private readonly createFeePlanUseCase: CreateIntegrationFeePlanUseCase,
    private readonly callFeeDueUseCase: CallIntegrationFeeDueUseCase,
    private readonly payFeeUseCase: PayIntegrationFeeUseCase,
    private readonly recordDonationUseCase: RecordDonationUseCase,
    private readonly recordExpenseUseCase: RecordExpenseUseCase,
    private readonly approveExpenseUseCase: ApproveExpenseUseCase,
    private readonly getStatsQuery: GetFinanceStatsQuery,
    private readonly listTxQuery: ListTransactionsQuery,
    private readonly getTxByIdQuery: GetTransactionByIdQuery,
    private readonly listCotisationsQuery: ListCotisationsQuery,
    private readonly listLeasesQuery: ListBuildingLeasesQuery,
    private readonly listRentExpensesQuery: ListBuildingRentExpensesQuery,
    private readonly listFeePlansQuery: ListIntegrationFeePlansQuery,
    private readonly listFeeDuesQuery: ListIntegrationFeeDuesQuery,
    private readonly getDebtorsQuery: GetIntegrationFeeDebtorsQuery,
    private readonly listDonationsQuery: ListDonationsQuery,
    private readonly listExpensesQuery: ListExpensesQuery,
  ) {}

  // ===========================================================================
  // 1. STATS & VUE GLOBALE TRÉSORERIE
  // ===========================================================================

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir la synthèse financière et soldes de caisse en XOF' })
  @ApiResponse({ status: 200, description: 'Statistiques financières globales ou par association' })
  @ApiQuery({ name: 'associationId', required: false, type: String })
  public async getStats(@Query('associationId') associationId?: string) {
    const stats = await this.getStatsQuery.execute(associationId);
    return {
      success: true,
      data: stats,
    };
  }

  // ===========================================================================
  // 2. GRAND LIVRE COMPTABLE / TRANSACTIONS IMMUABLES (ADR-006)
  // ===========================================================================

  @Get('transactions')
  @ApiOperation({ summary: 'Lister les écritures du journal financier' })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT'] })
  @ApiQuery({ name: 'category', required: false })
  public async listTransactions(
    @Query('associationId') associationId?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    const records = await this.listTxQuery.execute({ associationId, type, category });
    return {
      success: true,
      data: records.map((tx) => ({
        id: tx.id,
        associationId: tx.associationId,
        amount: tx.amount,
        currency: tx.currency,
        type: tx.type,
        status: tx.status,
        reference: tx.reference,
        description: tx.description,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        recordedById: tx.recordedById,
        createdAt: tx.createdAt,
      })),
    };
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Consulter une transaction par son identifiant unique' })
  @ApiParam({ name: 'id', format: 'uuid' })
  public async getTransactionById(@Param('id', ParseUUIDPipe) id: string) {
    const tx = await this.getTxByIdQuery.execute(id);
    return {
      success: !!tx,
      data: tx,
    };
  }

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrer une nouvelle écriture comptable confirmée (POSTED)' })
  public async recordTransaction(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: CreateTransactionDto,
  ) {
    const tx = await this.recordTxUseCase.execute({
      associationId: dto.associationId,
      amount: dto.amount,
      type: dto.type,
      reference: dto.reference,
      description: dto.description,
      category: dto.category,
      paymentMethod: dto.paymentMethod,
      recordedById: user.id,
    });
    return {
      success: true,
      message: 'Transaction enregistrée dans le grand livre avec succès.',
      data: tx,
    };
  }

  @Post('transactions/:id/adjust')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Générer une écriture compensatoire d’ajustement (ADR-006)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  public async createAdjustment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: CreateAdjustmentDto,
  ) {
    const adjustmentTx = await this.createAdjustmentUseCase.execute({
      originalTransactionId: id,
      adjustmentAmount: dto.adjustmentAmount,
      reason: dto.reason,
      recordedById: user.id,
    });
    return {
      success: true,
      message: 'Écriture compensatrice enregistrée avec succès.',
      data: adjustmentTx,
    };
  }

  // ===========================================================================
  // 3. COTISATIONS DES MEMBRES ADHÉRENTS
  // ===========================================================================

  @Get('cotisations')
  @ApiOperation({ summary: 'Lister les cotisations des membres associatifs' })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'period', required: false })
  public async listCotisations(
    @Query('associationId') associationId?: string,
    @Query('memberId') memberId?: string,
    @Query('period') period?: string,
  ) {
    const records = await this.listCotisationsQuery.execute({
      associationId,
      memberId,
      period,
    });
    return {
      success: true,
      data: records,
    };
  }

  @Post('cotisations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrer une cotisation membre avec génération automatique de la recette' })
  public async recordCotisation(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: RecordCotisationDto,
  ) {
    const cotisation = await this.recordCotisationUseCase.execute({
      associationId: dto.associationId,
      memberId: dto.memberId,
      amount: dto.amount,
      period: dto.period,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      recordedById: user.id,
    });
    return {
      success: true,
      message: 'Cotisation enregistrée avec succès.',
      data: cotisation,
    };
  }

  // ===========================================================================
  // 4. BAUX PROPRIÉTAIRES & LOYERS DES BÂTIMENTS (CHARGES ASSOCIATIVES)
  // ===========================================================================

  @Get('building-leases')
  @ApiOperation({ summary: 'Lister les baux liant l’association aux bailleurs des résidences' })
  @ApiQuery({ name: 'associationId', required: false })
  public async listBuildingLeases(@Query('associationId') associationId?: string) {
    const leases = await this.listLeasesQuery.execute(associationId);
    return {
      success: true,
      data: leases,
    };
  }

  @Post('building-leases')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Déclarer un contrat de bail de bâtiment' })
  public async createBuildingLease(@Body() dto: CreateBuildingLeaseDto) {
    const lease = await this.createLeaseUseCase.execute({
      buildingId: dto.buildingId,
      associationId: dto.associationId,
      monthlyRentAmount: dto.monthlyRentAmount,
      paymentDayOfMonth: dto.paymentDayOfMonth,
      leaseStartDate: new Date(dto.leaseStartDate),
      leaseEndDate: dto.leaseEndDate ? new Date(dto.leaseEndDate) : null,
    });
    return {
      success: true,
      message: 'Bail de résidence enregistré.',
      data: lease,
    };
  }

  @Get('building-rent-expenses')
  @ApiOperation({ summary: 'Consulter l’échéancier des loyers dus aux propriétaires' })
  @ApiQuery({ name: 'leaseId', required: false })
  @ApiQuery({ name: 'monthYear', required: false })
  public async listRentExpenses(
    @Query('leaseId') leaseId?: string,
    @Query('monthYear') monthYear?: string,
  ) {
    const expenses = await this.listRentExpensesQuery.execute({ leaseId, monthYear });
    return {
      success: true,
      data: expenses,
    };
  }

  @Post('building-rent-expenses/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Générer une échéance mensuelle de loyer pour un bâtiment loué' })
  public async generateRentExpense(@Body() dto: GenerateRentExpenseDto) {
    const expense = await this.processRentExpenseUseCase.execute({
      leaseId: dto.leaseId,
      monthYear: dto.monthYear,
    });
    return {
      success: true,
      message: 'Échéance de loyer générée.',
      data: expense,
    };
  }

  @Post('building-rent-expenses/:id/settle')
  @ApiOperation({ summary: 'Régler le loyer au propriétaire bailleur et enregistrer la dépense' })
  @ApiParam({ name: 'id', format: 'uuid' })
  public async settleRentExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: SettleRentExpenseDto,
  ) {
    const expense = await this.settleRentExpenseUseCase.execute({
      expenseId: id,
      paymentMethod: dto.paymentMethod,
      recordedById: user.id,
      notes: dto.notes,
    });
    return {
      success: true,
      message: 'Loyer réglé au bailleur et enregistré en dépense.',
      data: expense,
    };
  }

  // ===========================================================================
  // 5. FRAIS D’INTÉGRATION DES ÉTUDIANTS RÉSIDENTS (RECETTES)
  // ===========================================================================

  @Get('integration-fee-plans')
  @ApiOperation({ summary: 'Consulter les barèmes de frais d’intégration' })
  @ApiQuery({ name: 'associationId', required: false })
  public async listIntegrationFeePlans(@Query('associationId') associationId?: string) {
    const plans = await this.listFeePlansQuery.execute(associationId);
    return {
      success: true,
      data: plans,
    };
  }

  @Post('integration-fee-plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Définir un barème de frais d’intégration annuel' })
  public async createIntegrationFeePlan(@Body() dto: CreateIntegrationFeePlanDto) {
    const plan = await this.createFeePlanUseCase.execute({
      associationId: dto.associationId,
      academicYear: dto.academicYear,
      name: dto.name,
      amount: dto.amount,
      installmentsAllowed: dto.installmentsAllowed,
    });
    return {
      success: true,
      message: 'Barème de frais d’intégration créé.',
      data: plan,
    };
  }

  @Get('integration-fee-dues')
  @ApiOperation({ summary: 'Lister les appels de frais d’intégration' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'SETTLED'] })
  public async listIntegrationFeeDues(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    const dues = await this.listFeeDuesQuery.execute({ userId, status });
    return {
      success: true,
      data: dues,
    };
  }

  @Get('integration-fee-dues/debtors')
  @ApiOperation({ summary: 'Consulter la liste nominative des résidents débiteurs avec reste dû' })
  @ApiQuery({ name: 'associationId', required: false })
  public async getIntegrationDebtors(@Query('associationId') associationId?: string) {
    const debtors = await this.getDebtorsQuery.execute(associationId);
    return {
      success: true,
      data: debtors,
    };
  }

  @Post('integration-fee-dues/call')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Appeler les frais d’intégration pour un contrat d’occupation de chambre' })
  public async callIntegrationFeeDue(@Body() dto: CallIntegrationFeeDueDto) {
    const due = await this.callFeeDueUseCase.execute({
      occupationId: dto.occupationId,
      userId: dto.userId,
      planId: dto.planId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return {
      success: true,
      message: 'Appel de frais d’intégration émis avec succès.',
      data: due,
    };
  }

  @Post('integration-fee-dues/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enregistrer un versement sur frais d’intégration (Mobile Money, Espèces, Virement)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  public async payIntegrationFee(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: PayIntegrationFeeDto,
  ) {
    const result = await this.payFeeUseCase.execute({
      dueId: id,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      recordedById: user.id,
    });
    return {
      success: true,
      message: `Versement de ${result.payment.amount} XOF enregistré. Reste à payer : ${result.remainingAmount} XOF.`,
      data: {
        receiptReference: result.payment.receiptReference,
        amountPaid: result.payment.amount,
        remainingAmount: result.remainingAmount,
        status: result.dueStatus,
        transactionId: result.transaction.id,
        paidAt: result.payment.paidAt,
      },
    };
  }

  @Get('integration-fee-debtors')
  @ApiOperation({ summary: 'Lister les résidents débiteurs de frais d’intégration' })
  @ApiQuery({ name: 'associationId', required: false })
  public async listIntegrationFeeDebtors(@Query('associationId') associationId?: string) {
    const debtors = await this.getDebtorsQuery.execute(associationId);
    return {
      success: true,
      data: debtors,
    };
  }


  // ===========================================================================
  // 6. DONS & PHILANTHROPIE
  // ===========================================================================

  @Get('donations')
  @ApiOperation({ summary: 'Lister les dons reçus' })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiQuery({ name: 'campaignName', required: false })
  @ApiQuery({ name: 'paymentMethod', required: false })
  public async listDonations(
    @Query('associationId') associationId?: string,
    @Query('campaignName') campaignName?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    const records = await this.listDonationsQuery.execute({
      associationId,
      campaignName,
      paymentMethod,
    });
    return {
      success: true,
      data: records.map((d) => ({
        id: d.id,
        associationId: d.associationId,
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        donorPhone: d.donorPhone,
        amount: d.amount,
        currency: d.currency,
        paymentMethod: d.paymentMethod,
        campaignName: d.campaignName,
        reference: d.reference,
        transactionId: d.transactionId,
        notes: d.notes,
        receivedAt: d.receivedAt,
        createdAt: d.createdAt,
      })),
    };
  }

  @Post('donations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrer un don (Mobile Money, Espèces, Virement)' })
  public async recordDonation(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: RecordDonationDto,
  ) {
    const donation = await this.recordDonationUseCase.execute({
      associationId: dto.associationId,
      donorName: dto.donorName,
      donorEmail: dto.donorEmail,
      donorPhone: dto.donorPhone,
      amount: dto.amount,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod,
      campaignName: dto.campaignName,
      notes: dto.notes,
      recordedById: user.id,
    });

    return {
      success: true,
      message: `Don de ${donation.amount} ${donation.currency} enregistré avec succès (Réf: ${donation.reference}).`,
      data: donation,
    };
  }

  // ===========================================================================
  // 7. DÉPENSES & DÉCAISSEMENTS
  // ===========================================================================

  @Get('expenses')
  @ApiOperation({ summary: 'Lister les dépenses associatives' })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  public async listExpenses(
    @Query('associationId') associationId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const records = await this.listExpensesQuery.execute({
      associationId,
      category,
      status,
    });
    return {
      success: true,
      data: records.map((e) => ({
        id: e.id,
        associationId: e.associationId,
        title: e.title,
        category: e.category,
        amount: e.amount,
        currency: e.currency,
        beneficiary: e.beneficiary,
        paymentMethod: e.paymentMethod,
        status: e.status,
        receiptRef: e.receiptRef,
        transactionId: e.transactionId,
        notes: e.notes,
        expenseDate: e.expenseDate,
        recordedById: e.recordedById,
        createdAt: e.createdAt,
      })),
    };
  }

  @Post('expenses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrer un engagement ou décaissement de dépense' })
  public async recordExpense(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: RecordExpenseDto,
  ) {
    const expense = await this.recordExpenseUseCase.execute({
      associationId: dto.associationId,
      title: dto.title,
      category: dto.category,
      amount: dto.amount,
      currency: dto.currency,
      beneficiary: dto.beneficiary,
      paymentMethod: dto.paymentMethod,
      status: dto.status as any,
      receiptRef: dto.receiptRef,
      notes: dto.notes,
      recordedById: user.id,
    });

    return {
      success: true,
      message: `Dépense "${expense.title}" enregistrée avec succès.`,
      data: expense,
    };
  }

  @Post('expenses/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approuver et décaisser une dépense en attente' })
  @ApiParam({ name: 'id', format: 'uuid' })
  public async approveExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserAccountEntity,
    @Body() _dto: ApproveExpenseDto,
  ) {
    const expense = await this.approveExpenseUseCase.execute({
      expenseId: id,
      approvedById: user.id,
    });

    return {
      success: true,
      message: `Dépense "${expense.title}" validée et décaissée au grand livre.`,
      data: expense,
    };
  }
}


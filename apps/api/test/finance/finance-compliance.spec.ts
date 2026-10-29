import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  FinancialTransactionEntity,
  CotisationEntity,
  BuildingLeaseEntity,
  BuildingRentExpenseEntity,
  IntegrationFeePlanEntity,
  IntegrationFeeDueEntity,
  IntegrationFeePaymentEntity,
  DonationEntity,
  ExpenseEntity,
  MoneyXOF,
  FinancialImmutabilityPolicy,
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
  ListCotisationsQuery,
  ListBuildingLeasesQuery,
  ListIntegrationFeeDuesQuery,
  GetIntegrationFeeDebtorsQuery,
  ListDonationsQuery,
  ListExpensesQuery,
  type FinanceReaderPort,
  type FinanceWriterPort,
  type FinanceStats,
  type IntegrationFeeDebtorSummary,
  type ListTransactionsFilter,
  type ListCotisationsFilter,
  type ListRentExpensesFilter,
  type ListIntegrationFeeDuesFilter,
  type ListDonationsFilter,
  type ListExpensesFilter,
  TransactionPostedEvent,
  CotisationRecordedEvent,
  IntegrationFeePaidEvent,
  DonationReceivedEvent,
  ExpenseRecordedEvent,
} from '../../src/modules/finance/index.js';
import { ConflictException, BadRequestException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

// =============================================================================
// IN-MEMORY FINANCE REPOSITORY (DIP & LSP)
// =============================================================================

class InMemoryFinanceRepository implements FinanceReaderPort, FinanceWriterPort {
  public transactions = new Map<string, FinancialTransactionEntity>();
  public cotisations = new Map<string, CotisationEntity>();
  public leases = new Map<string, BuildingLeaseEntity>();
  public rentExpenses = new Map<string, BuildingRentExpenseEntity>();
  public feePlans = new Map<string, IntegrationFeePlanEntity>();
  public feeDues = new Map<string, IntegrationFeeDueEntity>();
  public feePayments = new Map<string, IntegrationFeePaymentEntity>();
  public donations = new Map<string, DonationEntity>();
  public expenses = new Map<string, ExpenseEntity>();

  // Transactions
  async findTransactionById(id: string): Promise<FinancialTransactionEntity | null> {
    return this.transactions.get(id) ?? null;
  }
  async findTransactionByReference(reference: string): Promise<FinancialTransactionEntity | null> {
    for (const tx of this.transactions.values()) {
      if (tx.reference === reference) return tx;
    }
    return null;
  }
  async listTransactions(filter?: ListTransactionsFilter): Promise<FinancialTransactionEntity[]> {
    return Array.from(this.transactions.values()).filter((tx) => {
      if (filter?.associationId && tx.associationId !== filter.associationId) return false;
      if (filter?.type && tx.type !== filter.type) return false;
      if (filter?.status && tx.status !== filter.status) return false;
      if (filter?.category && tx.category !== filter.category) return false;
      return true;
    });
  }
  async saveTransaction(transaction: FinancialTransactionEntity): Promise<void> {
    this.transactions.set(transaction.id, transaction);
  }

  // Cotisations
  async findCotisationById(id: string): Promise<CotisationEntity | null> {
    return this.cotisations.get(id) ?? null;
  }
  async listCotisations(filter?: ListCotisationsFilter): Promise<CotisationEntity[]> {
    return Array.from(this.cotisations.values()).filter((c) => {
      if (filter?.associationId && c.associationId !== filter.associationId) return false;
      if (filter?.memberId && c.memberId !== filter.memberId) return false;
      if (filter?.period && c.period !== filter.period) return false;
      return true;
    });
  }
  async saveCotisation(cotisation: CotisationEntity): Promise<void> {
    this.cotisations.set(cotisation.id, cotisation);
  }

  // Leases & Rents
  async findBuildingLeaseById(id: string): Promise<BuildingLeaseEntity | null> {
    return this.leases.get(id) ?? null;
  }
  async findBuildingLeaseByBuildingId(buildingId: string): Promise<BuildingLeaseEntity | null> {
    for (const lease of this.leases.values()) {
      if (lease.buildingId === buildingId && lease.isActive) return lease;
    }
    return null;
  }
  async listBuildingLeases(associationId?: string): Promise<BuildingLeaseEntity[]> {
    return Array.from(this.leases.values()).filter((l) =>
      associationId ? l.associationId === associationId : true,
    );
  }
  async saveBuildingLease(lease: BuildingLeaseEntity): Promise<void> {
    this.leases.set(lease.id, lease);
  }

  async findRentExpenseById(id: string): Promise<BuildingRentExpenseEntity | null> {
    return this.rentExpenses.get(id) ?? null;
  }
  async listRentExpenses(filter?: ListRentExpensesFilter): Promise<BuildingRentExpenseEntity[]> {
    return Array.from(this.rentExpenses.values()).filter((r) => {
      if (filter?.leaseId && r.leaseId !== filter.leaseId) return false;
      if (filter?.monthYear && r.monthYear !== filter.monthYear) return false;
      if (filter?.status && r.status !== filter.status) return false;
      return true;
    });
  }
  async saveRentExpense(rentExpense: BuildingRentExpenseEntity): Promise<void> {
    this.rentExpenses.set(rentExpense.id, rentExpense);
  }

  // Integration Fees
  async findIntegrationFeePlanById(id: string): Promise<IntegrationFeePlanEntity | null> {
    return this.feePlans.get(id) ?? null;
  }
  async findIntegrationFeePlanByYear(
    associationId: string,
    academicYear: string,
  ): Promise<IntegrationFeePlanEntity | null> {
    for (const plan of this.feePlans.values()) {
      if (plan.associationId === associationId && plan.academicYear === academicYear) {
        return plan;
      }
    }
    return null;
  }
  async listIntegrationFeePlans(associationId?: string): Promise<IntegrationFeePlanEntity[]> {
    return Array.from(this.feePlans.values()).filter((p) =>
      associationId ? p.associationId === associationId : true,
    );
  }
  async saveIntegrationFeePlan(plan: IntegrationFeePlanEntity): Promise<void> {
    this.feePlans.set(plan.id, plan);
  }

  async findIntegrationFeeDueById(id: string): Promise<IntegrationFeeDueEntity | null> {
    return this.feeDues.get(id) ?? null;
  }
  async findIntegrationFeeDueByOccupationId(occupationId: string): Promise<IntegrationFeeDueEntity | null> {
    for (const due of this.feeDues.values()) {
      if (due.occupationId === occupationId) return due;
    }
    return null;
  }
  async listIntegrationFeeDues(filter?: ListIntegrationFeeDuesFilter): Promise<IntegrationFeeDueEntity[]> {
    return Array.from(this.feeDues.values()).filter((d) => {
      if (filter?.userId && d.userId !== filter.userId) return false;
      if (filter?.status && d.status !== filter.status) return false;
      if (filter?.planId && d.planId !== filter.planId) return false;
      return true;
    });
  }
  async saveIntegrationFeeDue(due: IntegrationFeeDueEntity): Promise<void> {
    this.feeDues.set(due.id, due);
  }

  async saveIntegrationFeePayment(payment: IntegrationFeePaymentEntity): Promise<void> {
    this.feePayments.set(payment.id, payment);
  }

  async listIntegrationFeeDebtors(associationId?: string): Promise<IntegrationFeeDebtorSummary[]> {
    const debtors: IntegrationFeeDebtorSummary[] = [];
    for (const due of this.feeDues.values()) {
      if (due.status !== 'SETTLED') {
        const plan = this.feePlans.get(due.planId);
        if (associationId && plan && plan.associationId !== associationId) continue;
        debtors.push({
          dueId: due.id,
          userId: due.userId,
          userName: 'Étudiant Test',
          userPhone: '+229 97 00 11 22',
          roomNumber: 'A-101',
          buildingName: 'Villa Cité U',
          quarterName: 'Campus UAC',
          totalAmount: due.totalAmount,
          paidAmount: due.paidAmount,
          remainingAmount: due.remainingAmount,
          status: due.status,
          dueDate: due.dueDate,
        });
      }
    }
    return debtors;
  }

  // Donations
  async findDonationById(id: string): Promise<DonationEntity | null> {
    return this.donations.get(id) ?? null;
  }
  async listDonations(filter?: ListDonationsFilter): Promise<DonationEntity[]> {
    return Array.from(this.donations.values()).filter((d) => {
      if (filter?.associationId && d.associationId !== filter.associationId) return false;
      if (filter?.campaignName && !d.campaignName?.toLowerCase().includes(filter.campaignName.toLowerCase())) return false;
      if (filter?.paymentMethod && d.paymentMethod !== filter.paymentMethod) return false;
      return true;
    });
  }
  async saveDonation(donation: DonationEntity): Promise<void> {
    this.donations.set(donation.id, donation);
  }

  // Expenses
  async findExpenseById(id: string): Promise<ExpenseEntity | null> {
    return this.expenses.get(id) ?? null;
  }
  async listExpenses(filter?: ListExpensesFilter): Promise<ExpenseEntity[]> {
    return Array.from(this.expenses.values()).filter((e) => {
      if (filter?.associationId && e.associationId !== filter.associationId) return false;
      if (filter?.category && e.category !== filter.category) return false;
      if (filter?.status && e.status !== filter.status) return false;
      return true;
    });
  }
  async saveExpense(expense: ExpenseEntity): Promise<void> {
    this.expenses.set(expense.id, expense);
  }

  // Stats & Totals
  async getFinanceStats(associationId?: string): Promise<FinanceStats> {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCotisations = 0;
    let totalDonations = 0;
    let totalIntegrationFees = 0;
    let totalLandlordRents = 0;
    const expensesByCategory: Record<string, number> = {};
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    for (const tx of this.transactions.values()) {
      if (associationId && tx.associationId !== associationId) continue;
      if (tx.status !== 'POSTED') continue;

      const d = new Date(tx.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }

      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        monthlyMap[monthKey].income += tx.amount;
        if (tx.category === 'COTISATION') totalCotisations += tx.amount;
        else if (tx.category === 'DON' || tx.category === 'DONATION') totalDonations += tx.amount;
        else if (tx.category === 'INTEGRATION_FEE') totalIntegrationFees += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
        monthlyMap[monthKey].expense += tx.amount;
        if (tx.category === 'BUILDING_RENT' || tx.category === 'LOYER_BAILLEUR') {
          totalLandlordRents += tx.amount;
        }
        const cat = tx.category || 'AUTRE';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + tx.amount;
      } else if (tx.type === 'ADJUSTMENT') {
        totalIncome += tx.amount;
      }
    }

    const monthlyBreakdown = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }));

    let pendingIntegrationDues = 0;
    for (const due of this.feeDues.values()) {
      if (due.status !== 'SETTLED') {
        pendingIntegrationDues += due.remainingAmount;
      }
    }

    let pendingBuildingRent = 0;
    for (const exp of this.rentExpenses.values()) {
      if (exp.status === 'PENDING') {
        pendingBuildingRent += exp.amount;
      }
    }

    return {
      totalIncomeXOF: totalIncome,
      totalExpenseXOF: totalExpense,
      netBalanceXOF: totalIncome - totalExpense,
      totalCotisationsXOF: totalCotisations,
      totalDonationsXOF: totalDonations,
      totalIntegrationFeesXOF: totalIntegrationFees,
      totalLandlordRentsXOF: totalLandlordRents,
      pendingIntegrationDuesXOF: pendingIntegrationDues,
      pendingBuildingRentXOF: pendingBuildingRent,
      transactionsCount: this.transactions.size,
      expensesByCategory,
      monthlyBreakdown,
    };
  }
}

// =============================================================================
// TEST SUITE: FINANCE MODULE (SOLID & ADR-006)
// =============================================================================

describe('Finance Module — Conformité SOLID & Intégration Résidence', () => {
  let repository: InMemoryFinanceRepository;
  let mockEventEmitter: EventEmitter2;

  // Use cases
  let recordTxUseCase: RecordTransactionUseCase;
  let createAdjustmentUseCase: CreateAdjustmentUseCase;
  let recordCotisationUseCase: RecordCotisationUseCase;
  let createLeaseUseCase: CreateBuildingLeaseUseCase;
  let processRentExpenseUseCase: ProcessBuildingRentExpenseUseCase;
  let settleRentExpenseUseCase: SettleBuildingRentExpenseUseCase;
  let createFeePlanUseCase: CreateIntegrationFeePlanUseCase;
  let callFeeDueUseCase: CallIntegrationFeeDueUseCase;
  let payFeeUseCase: PayIntegrationFeeUseCase;
  let recordDonationUseCase: RecordDonationUseCase;
  let recordExpenseUseCase: RecordExpenseUseCase;
  let approveExpenseUseCase: ApproveExpenseUseCase;

  // Queries
  let getStatsQuery: GetFinanceStatsQuery;
  let listTxQuery: ListTransactionsQuery;
  let listCotisationsQuery: ListCotisationsQuery;
  let listLeasesQuery: ListBuildingLeasesQuery;
  let listFeeDuesQuery: ListIntegrationFeeDuesQuery;
  let getDebtorsQuery: GetIntegrationFeeDebtorsQuery;
  let listDonationsQuery: ListDonationsQuery;
  let listExpensesQuery: ListExpensesQuery;

  const mockAssocId = randomUUID();
  const mockUserId = randomUUID();
  const mockBuildingId = randomUUID();
  const mockOccupationId = randomUUID();

  beforeEach(() => {
    repository = new InMemoryFinanceRepository();
    mockEventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    recordTxUseCase = new RecordTransactionUseCase(repository, mockEventEmitter);
    createAdjustmentUseCase = new CreateAdjustmentUseCase(repository, repository, mockEventEmitter);
    recordCotisationUseCase = new RecordCotisationUseCase(repository, mockEventEmitter);
    createLeaseUseCase = new CreateBuildingLeaseUseCase(repository, repository);
    processRentExpenseUseCase = new ProcessBuildingRentExpenseUseCase(repository, repository);
    settleRentExpenseUseCase = new SettleBuildingRentExpenseUseCase(repository, repository, mockEventEmitter);
    createFeePlanUseCase = new CreateIntegrationFeePlanUseCase(repository, repository);
    callFeeDueUseCase = new CallIntegrationFeeDueUseCase(repository, repository);
    payFeeUseCase = new PayIntegrationFeeUseCase(repository, repository, mockEventEmitter);
    recordDonationUseCase = new RecordDonationUseCase(repository, mockEventEmitter);
    recordExpenseUseCase = new RecordExpenseUseCase(repository, mockEventEmitter);
    approveExpenseUseCase = new ApproveExpenseUseCase(repository, repository, mockEventEmitter);

    getStatsQuery = new GetFinanceStatsQuery(repository);
    listTxQuery = new ListTransactionsQuery(repository);
    listCotisationsQuery = new ListCotisationsQuery(repository);
    listLeasesQuery = new ListBuildingLeasesQuery(repository);
    listFeeDuesQuery = new ListIntegrationFeeDuesQuery(repository);
    getDebtorsQuery = new GetIntegrationFeeDebtorsQuery(repository);
    listDonationsQuery = new ListDonationsQuery(repository);
    listExpensesQuery = new ListExpensesQuery(repository);
  });

  // ---------------------------------------------------------------------------
  // 1. INVARIANTS DU DOMAINE PUR
  // ---------------------------------------------------------------------------
  describe('1. Invariants du Domaine Pur (Domain Entities & Value Objects)', () => {
    it('devrait instancier un objet valeur MoneyXOF et formater en FCFA', () => {
      const money = MoneyXOF.of(35000);
      expect(money.amount).toBe(35000);
      expect(money.format()).toContain('35');
      expect(money.format()).toContain('FCFA');

      const sum = money.add(MoneyXOF.of(5000));
      expect(sum.amount).toBe(40000);

      const diff = money.subtract(MoneyXOF.of(15000));
      expect(diff.amount).toBe(20000);

      expect(() => MoneyXOF.of(-500)).toThrow('Le montant en XOF doit être un nombre positif ou nul.');
      expect(() => money.subtract(MoneyXOF.of(50000))).toThrow('Solde insuffisant');
    });

    it('devrait créer une FinancialTransactionEntity valide avec devise XOF par défaut', () => {
      const tx = FinancialTransactionEntity.create({
        associationId: mockAssocId,
        amount: 25000,
        type: 'INCOME',
        category: 'COTISATION',
        recordedById: mockUserId,
      });

      expect(tx.id).toBeDefined();
      expect(tx.amount).toBe(25000);
      expect(tx.currency).toBe('XOF');
      expect(tx.status).toBe('POSTED');
      expect(tx.reference).toMatch(/^TX-/);
    });

    it('devrait rejeter une transaction avec montant <= 0 ou sans recordedById', () => {
      expect(() =>
        FinancialTransactionEntity.create({
          amount: 0,
          type: 'INCOME',
          recordedById: mockUserId,
        }),
      ).toThrow('Le montant de la transaction doit être supérieur à zéro.');

      expect(() =>
        FinancialTransactionEntity.create({
          amount: 1000,
          type: 'INCOME',
          recordedById: '',
        }),
      ).toThrow("L'identifiant de l'auteur de l'enregistrement est obligatoire.");
    });

    it('devrait appliquer la politique d’immutabilité (ADR-006)', () => {
      const tx = FinancialTransactionEntity.create({
        amount: 10000,
        type: 'INCOME',
        recordedById: mockUserId,
      });

      expect(() => FinancialImmutabilityPolicy.assertCannotBeDeleted(tx)).toThrow(
        "Conformément à l'ADR-006, une transaction confirmée ('POSTED') ne peut être supprimée.",
      );
      expect(() => FinancialImmutabilityPolicy.assertCanBeAdjusted(tx)).not.toThrow();
    });

    it('devrait créer une écriture compensatoire d’ajustement valide', () => {
      const originalTx = FinancialTransactionEntity.create({
        amount: 10000,
        type: 'INCOME',
        reference: 'TX-REC-001',
        recordedById: mockUserId,
      });

      const adj = FinancialTransactionEntity.createAdjustment(
        originalTx,
        2000,
        'Erreur de saisie opérateur',
        mockUserId,
      );

      expect(adj.type).toBe('ADJUSTMENT');
      expect(adj.amount).toBe(2000);
      expect(adj.reference).toBe('ADJ-TX-REC-001');
      expect(adj.description).toContain('Erreur de saisie');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. WORKFLOW 1 : FRAIS D’INTÉGRATION DES ÉTUDIANTS (RECETTES)
  // ---------------------------------------------------------------------------
  describe('2. Workflow Résidence : Frais d’Intégration des Étudiants Entrants', () => {
    it('devrait définir un barème de frais d’intégration annuel pour l’association', async () => {
      const plan = await createFeePlanUseCase.execute({
        associationId: mockAssocId,
        academicYear: '2026-2027',
        name: 'Forfait Intégration Résidence 2026-2027',
        amount: 35000,
        installmentsAllowed: 2,
      });

      expect(plan.id).toBeDefined();
      expect(plan.amount).toBe(35000);
      expect(plan.academicYear).toBe('2026-2027');

      // Tentative de doublon sur la même année
      await expect(
        createFeePlanUseCase.execute({
          associationId: mockAssocId,
          academicYear: '2026-2027',
          name: 'Barème Bis',
          amount: 40000,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait émettre un appel de frais d’intégration lors de l’attribution de chambre', async () => {
      const plan = await createFeePlanUseCase.execute({
        associationId: mockAssocId,
        academicYear: '2026-2027',
        name: 'Barème 2026',
        amount: 35000,
      });

      const due = await callFeeDueUseCase.execute({
        occupationId: mockOccupationId,
        userId: mockUserId,
        planId: plan.id,
      });

      expect(due.id).toBeDefined();
      expect(due.totalAmount).toBe(35000);
      expect(due.paidAmount).toBe(0);
      expect(due.remainingAmount).toBe(35000);
      expect(due.status).toBe('PENDING');

      // Rejet si déjà appelé pour ce contrat
      await expect(
        callFeeDueUseCase.execute({
          occupationId: mockOccupationId,
          userId: mockUserId,
          planId: plan.id,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait enregistrer un versement partiel puis solde avec génération automatique du reçu', async () => {
      const plan = await createFeePlanUseCase.execute({
        associationId: mockAssocId,
        academicYear: '2026-2027',
        name: 'Barème 2026',
        amount: 35000,
      });

      const due = await callFeeDueUseCase.execute({
        occupationId: mockOccupationId,
        userId: mockUserId,
        planId: plan.id,
      });

      // 1. Premier versement : 20 000 XOF
      const tranche1 = await payFeeUseCase.execute({
        dueId: due.id,
        amount: 20000,
        paymentMethod: 'MOBILE_MONEY',
        recordedById: mockUserId,
      });

      expect(tranche1.payment.receiptReference).toMatch(/^REC-2026-/);
      expect(tranche1.remainingAmount).toBe(15000);
      expect(tranche1.dueStatus).toBe('PARTIAL');
      expect(tranche1.transaction.type).toBe('INCOME');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        IntegrationFeePaidEvent.EVENT_NAME,
        expect.any(IntegrationFeePaidEvent),
      );

      // Rejet si versement > reste à payer
      await expect(
        payFeeUseCase.execute({
          dueId: due.id,
          amount: 25000,
          paymentMethod: 'MOBILE_MONEY',
          recordedById: mockUserId,
        }),
      ).rejects.toThrow(BadRequestException);

      // 2. Deuxième versement : 15 000 XOF (Solde)
      const tranche2 = await payFeeUseCase.execute({
        dueId: due.id,
        amount: 15000,
        paymentMethod: 'CASH',
        recordedById: mockUserId,
      });

      expect(tranche2.remainingAmount).toBe(0);
      expect(tranche2.dueStatus).toBe('SETTLED');

      // Rejet si paiement sur créance déjà soldée
      await expect(
        payFeeUseCase.execute({
          dueId: due.id,
          amount: 1000,
          paymentMethod: 'CASH',
          recordedById: mockUserId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lister les résidents débiteurs avec reste dû calculé côté serveur', async () => {
      const plan = await createFeePlanUseCase.execute({
        associationId: mockAssocId,
        academicYear: '2026-2027',
        name: 'Barème',
        amount: 35000,
      });

      const due = await callFeeDueUseCase.execute({
        occupationId: mockOccupationId,
        userId: mockUserId,
        planId: plan.id,
      });

      await payFeeUseCase.execute({
        dueId: due.id,
        amount: 10000,
        paymentMethod: 'MOBILE_MONEY',
        recordedById: mockUserId,
      });

      const debtors = await getDebtorsQuery.execute(mockAssocId);
      expect(debtors).toHaveLength(1);
      expect(debtors[0].totalAmount).toBe(35000);
      expect(debtors[0].paidAmount).toBe(10000);
      expect(debtors[0].remainingAmount).toBe(25000);
      expect(debtors[0].status).toBe('PARTIAL');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. WORKFLOW 2 : BAUX PROPRIÉTAIRES & LOYERS DES BÂTIMENTS (DÉPENSES)
  // ---------------------------------------------------------------------------
  describe('3. Workflow Résidence : Baux Propriétaires & Loyers de l’Association (EXPENSE)', () => {
    it('devrait enregistrer un contrat de bail de bâtiment loué par l’association', async () => {
      const lease = await createLeaseUseCase.execute({
        buildingId: mockBuildingId,
        associationId: mockAssocId,
        monthlyRentAmount: 350000,
        paymentDayOfMonth: 5,
        leaseStartDate: new Date('2026-01-01'),
      });

      expect(lease.id).toBeDefined();
      expect(lease.monthlyRentAmount).toBe(350000);
      expect(lease.paymentDayOfMonth).toBe(5);
      expect(lease.isActive).toBe(true);

      // Doublon de bail actif sur même bâtiment
      await expect(
        createLeaseUseCase.execute({
          buildingId: mockBuildingId,
          associationId: mockAssocId,
          monthlyRentAmount: 400000,
          leaseStartDate: new Date('2026-06-01'),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait générer l’échéance mensuelle de loyer pour le bailleur', async () => {
      const lease = await createLeaseUseCase.execute({
        buildingId: mockBuildingId,
        associationId: mockAssocId,
        monthlyRentAmount: 350000,
        paymentDayOfMonth: 5,
        leaseStartDate: new Date('2026-01-01'),
      });

      const expense = await processRentExpenseUseCase.execute({
        leaseId: lease.id,
        monthYear: '2026-11',
      });

      expect(expense.id).toBeDefined();
      expect(expense.amount).toBe(350000);
      expect(expense.status).toBe('PENDING');
      expect(expense.monthYear).toBe('2026-11');

      // Rejet si échéance déjà générée pour ce mois
      await expect(
        processRentExpenseUseCase.execute({
          leaseId: lease.id,
          monthYear: '2026-11',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait régler le loyer au bailleur et imputer la dépense dans le grand livre', async () => {
      const lease = await createLeaseUseCase.execute({
        buildingId: mockBuildingId,
        associationId: mockAssocId,
        monthlyRentAmount: 350000,
        paymentDayOfMonth: 5,
        leaseStartDate: new Date('2026-01-01'),
      });

      const expense = await processRentExpenseUseCase.execute({
        leaseId: lease.id,
        monthYear: '2026-11',
      });

      const settled = await settleRentExpenseUseCase.execute({
        expenseId: expense.id,
        paymentMethod: 'BANK_TRANSFER',
        recordedById: mockUserId,
        notes: 'Virement bancaire propriétaire',
      });

      expect(settled.status).toBe('PAID');
      expect(settled.paidAt).toBeDefined();
      expect(settled.transactionId).toBeDefined();

      // Vérifier écriture EXPENSE au grand livre
      const tx = await repository.findTransactionById(settled.transactionId!);
      expect(tx).not.toBeNull();
      expect(tx?.type).toBe('EXPENSE');
      expect(tx?.category).toBe('LOYER_BAILLEUR');
      expect(tx?.amount).toBe(350000);

      // Rejet si règlement d'une échéance déjà payée
      await expect(
        settleRentExpenseUseCase.execute({
          expenseId: expense.id,
          recordedById: mockUserId,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. COTISATIONS ADHÉRENTS & SYNTHÈSE DE TRÉSORERIE
  // ---------------------------------------------------------------------------
  describe('4. Cotisations Adhérents & Synthèse Globale de Trésorerie', () => {
    it('devrait enregistrer une cotisation membre avec écriture INCOME automatique', async () => {
      const cotisation = await recordCotisationUseCase.execute({
        associationId: mockAssocId,
        memberId: mockUserId,
        amount: 5000,
        period: '2026-10',
        paymentMethod: 'MOBILE_MONEY',
        recordedById: mockUserId,
      });

      expect(cotisation.id).toBeDefined();
      expect(cotisation.amount).toBe(5000);
      expect(cotisation.period).toBe('2026-10');
      expect(cotisation.transactionId).toBeDefined();

      const tx = await repository.findTransactionById(cotisation.transactionId!);
      expect(tx).not.toBeNull();
      expect(tx?.type).toBe('INCOME');
      expect(tx?.category).toBe('COTISATION');
      expect(tx?.amount).toBe(5000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        CotisationRecordedEvent.EVENT_NAME,
        expect.any(CotisationRecordedEvent),
      );
    });

    it('devrait calculer fidèlement les soldes de trésorerie (recettes, dépenses, créances)', async () => {
      // 1. Cotisation : +5 000 XOF
      await recordCotisationUseCase.execute({
        associationId: mockAssocId,
        memberId: mockUserId,
        amount: 5000,
        period: '2026-10',
        recordedById: mockUserId,
      });

      // 2. Frais d'intégration encaissés : +20 000 XOF (sur 35 000 XOF)
      const plan = await createFeePlanUseCase.execute({
        associationId: mockAssocId,
        academicYear: '2026-2027',
        name: 'Barème 2026',
        amount: 35000,
      });
      const due = await callFeeDueUseCase.execute({
        occupationId: mockOccupationId,
        userId: mockUserId,
        planId: plan.id,
      });
      await payFeeUseCase.execute({
        dueId: due.id,
        amount: 20000,
        paymentMethod: 'MOBILE_MONEY',
        recordedById: mockUserId,
      });

      // 3. Loyer bailleur réglé : -15 000 XOF
      const lease = await createLeaseUseCase.execute({
        buildingId: mockBuildingId,
        associationId: mockAssocId,
        monthlyRentAmount: 15000,
        leaseStartDate: new Date('2026-01-01'),
      });
      const expense = await processRentExpenseUseCase.execute({
        leaseId: lease.id,
        monthYear: '2026-11',
      });
      await settleRentExpenseUseCase.execute({
        expenseId: expense.id,
        recordedById: mockUserId,
      });

      // 4. Échéance de loyer suivante en attente : 15 000 XOF PENDING
      await processRentExpenseUseCase.execute({
        leaseId: lease.id,
        monthYear: '2026-12',
      });

      const stats = await getStatsQuery.execute(mockAssocId);

      // Recettes : 5 000 (cotisation) + 20 000 (intégration) = 25 000 XOF
      expect(stats.totalIncomeXOF).toBe(25000);
      // Dépenses : 15 000 XOF (loyer bailleur)
      expect(stats.totalExpenseXOF).toBe(15000);
      // Solde net de caisse : 25 000 - 15 000 = 10 000 XOF
      expect(stats.netBalanceXOF).toBe(10000);
      // Cotisations : 5 000 XOF
      expect(stats.totalCotisationsXOF).toBe(5000);
      // Créances intégration en attente : 35 000 - 20 000 = 15 000 XOF
      expect(stats.pendingIntegrationDuesXOF).toBe(15000);
      // Dettes loyer en attente : 15 000 XOF
      expect(stats.pendingBuildingRentXOF).toBe(15000);
      expect(stats.transactionsCount).toBe(3);

      // Vérification des requêtes dédiées
      const txList = await listTxQuery.execute({ associationId: mockAssocId });
      expect(txList).toHaveLength(3);

      const cotList = await listCotisationsQuery.execute({ associationId: mockAssocId });
      expect(cotList).toHaveLength(1);

      const leaseList = await listLeasesQuery.execute(mockAssocId);
      expect(leaseList).toHaveLength(1);

      const feeDueList = await listFeeDuesQuery.execute({ userId: mockUserId });
      expect(feeDueList).toHaveLength(1);
    });

    it('devrait enregistrer une écriture directe et un ajustement comptable', async () => {
      const tx = await recordTxUseCase.execute({
        associationId: mockAssocId,
        amount: 12000,
        type: 'INCOME',
        category: 'AUTRE',
        description: 'Subvention municipale ponctuelle',
        recordedById: mockUserId,
      });

      expect(tx.id).toBeDefined();
      expect(tx.type).toBe('INCOME');
      expect(tx.amount).toBe(12000);

      const adj = await createAdjustmentUseCase.execute({
        originalTransactionId: tx.id,
        adjustmentAmount: 2000,
        reason: 'Erreur de saisie initiale sur la subvention',
        recordedById: mockUserId,
      });

      expect(adj.id).toBeDefined();
      expect(adj.type).toBe('ADJUSTMENT');
      expect(adj.amount).toBe(2000);

      const allTx = await listTxQuery.execute({ associationId: mockAssocId });
      expect(allTx).toHaveLength(2);
    });

    it('devrait gérer totalement les dons : enregistrement, écriture au grand livre et consultation', async () => {
      const donation = await recordDonationUseCase.execute({
        associationId: mockAssocId,
        donorName: 'Dr. Amadou Diallo',
        donorEmail: 'amadou.diallo@example.com',
        donorPhone: '+229 97 11 22 33',
        amount: 50000,
        campaignName: 'Rentrée Solidaire 2026',
        paymentMethod: 'MOBILE_MONEY',
        notes: 'Soutien aux étudiants en difficulté',
        recordedById: mockUserId,
      });

      expect(donation.id).toBeDefined();
      expect(donation.amount).toBe(50000);
      expect(donation.currency).toBe('XOF');
      expect(donation.reference).toMatch(/^DON-/);
      expect(donation.transactionId).toBeDefined();

      const tx = await repository.findTransactionById(donation.transactionId!);
      expect(tx).not.toBeNull();
      expect(tx?.type).toBe('INCOME');
      expect(tx?.category).toBe('DON');
      expect(tx?.amount).toBe(50000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        DonationReceivedEvent.EVENT_NAME,
        expect.any(DonationReceivedEvent),
      );

      const donations = await listDonationsQuery.execute({ associationId: mockAssocId });
      expect(donations).toHaveLength(1);
      expect(donations[0].donorName).toBe('Dr. Amadou Diallo');

      const filteredByCamp = await listDonationsQuery.execute({ campaignName: 'Rentrée' });
      expect(filteredByCamp).toHaveLength(1);

      const filteredEmpty = await listDonationsQuery.execute({ campaignName: 'Inexistant' });
      expect(filteredEmpty).toHaveLength(0);
    });

    it('devrait gérer totalement les dépenses : directes, soumises à approbation et décaissement', async () => {
      // 1. Dépense payée directement
      const directExpense = await recordExpenseUseCase.execute({
        associationId: mockAssocId,
        title: 'Fournitures de bureau',
        category: 'EQUIPEMENT',
        amount: 8000,
        beneficiary: 'Papeterie Centrale',
        status: 'PAID',
        paymentMethod: 'CASH',
        recordedById: mockUserId,
      });

      expect(directExpense.id).toBeDefined();
      expect(directExpense.status).toBe('PAID');
      expect(directExpense.transactionId).toBeDefined();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        ExpenseRecordedEvent.EVENT_NAME,
        expect.any(ExpenseRecordedEvent),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        TransactionPostedEvent.EVENT_NAME,
        expect.any(TransactionPostedEvent),
      );

      const directTx = await repository.findTransactionById(directExpense.transactionId!);
      expect(directTx?.type).toBe('EXPENSE');
      expect(directTx?.amount).toBe(8000);

      // 2. Dépense en attente d'approbation
      const pendingExpense = await recordExpenseUseCase.execute({
        associationId: mockAssocId,
        title: 'Location de sonorisation AG',
        category: 'EVENEMENT',
        amount: 45000,
        beneficiary: 'Sono Presta SARL',
        status: 'PENDING_APPROVAL',
        paymentMethod: 'MOBILE_MONEY',
        recordedById: mockUserId,
      });

      expect(pendingExpense.id).toBeDefined();
      expect(pendingExpense.status).toBe('PENDING_APPROVAL');
      expect(pendingExpense.transactionId).toBeNull();

      // Approbation de la dépense
      const approvedExpense = await approveExpenseUseCase.execute({
        expenseId: pendingExpense.id,
        approvedById: mockUserId,
      });

      expect(approvedExpense.status).toBe('PAID');
      expect(approvedExpense.transactionId).toBeDefined();

      const approvedTx = await repository.findTransactionById(approvedExpense.transactionId!);
      expect(approvedTx?.type).toBe('EXPENSE');
      expect(approvedTx?.amount).toBe(45000);
      expect(approvedTx?.category).toBe('EVENEMENT');

      // Tenter de ré-approuver une dépense déjà payée doit échouer (ConflictException)
      await expect(
        approveExpenseUseCase.execute({
          expenseId: pendingExpense.id,
          approvedById: mockUserId,
        }),
      ).rejects.toThrow(ConflictException);

      // Consultation et filtrage des dépenses
      const allExpenses = await listExpensesQuery.execute({ associationId: mockAssocId });
      expect(allExpenses).toHaveLength(2);

      const eventExpenses = await listExpensesQuery.execute({ category: 'EVENEMENT' });
      expect(eventExpenses).toHaveLength(1);
    });

    it('devrait agréger les statistiques enrichies avec dons, intégration, loyers et ventilation mensuelle', async () => {
      // Don : +50 000 XOF
      await recordDonationUseCase.execute({
        associationId: mockAssocId,
        donorName: 'Mécène Université',
        amount: 50000,
        recordedById: mockUserId,
      });

      // Dépense logistique : -10 000 XOF
      await recordExpenseUseCase.execute({
        associationId: mockAssocId,
        title: 'Impression badges adhérents',
        category: 'LOGISTIQUE',
        amount: 10000,
        beneficiary: 'Imprimerie Moderne',
        status: 'PAID',
        recordedById: mockUserId,
      });

      const stats = await getStatsQuery.execute(mockAssocId);
      expect(stats.totalDonationsXOF).toBe(50000);
      expect(stats.expensesByCategory['LOGISTIQUE']).toBe(10000);
      expect(stats.monthlyBreakdown.length).toBeGreaterThanOrEqual(1);
      expect(stats.netBalanceXOF).toBe(40000);
    });
  });
});

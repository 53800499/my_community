import { Injectable } from '@nestjs/common';
import type {
  FinancialTransaction as PrismaTransaction,
  Cotisation as PrismaCotisation,
  BuildingLease as PrismaBuildingLease,
  BuildingRentExpense as PrismaBuildingRentExpense,
  IntegrationFeePlan as PrismaIntegrationFeePlan,
  IntegrationFeeDue as PrismaIntegrationFeeDue,
  Donation as PrismaDonation,
  Expense as PrismaExpense,
} from '@prisma/client';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import type { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import type { CotisationEntity } from '../../domain/entities/cotisation.entity.js';
import type { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';
import type { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';
import type { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';
import type { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';
import type { IntegrationFeePaymentEntity } from '../../domain/entities/integration-fee-payment.entity.js';
import type { DonationEntity } from '../../domain/entities/donation.entity.js';
import type { ExpenseEntity } from '../../domain/entities/expense.entity.js';
import type {
  FinanceReaderPort,
  FinanceStats,
  IntegrationFeeDebtorSummary,
  ListCotisationsFilter,
  ListIntegrationFeeDuesFilter,
  ListRentExpensesFilter,
  ListTransactionsFilter,
  ListDonationsFilter,
  ListExpensesFilter,
} from '../../application/ports/finance-reader.port.js';
import type { FinanceWriterPort } from '../../application/ports/finance-writer.port.js';
import { FinanceMapper } from '../mappers/finance.mapper.js';

@Injectable()
export class PrismaFinanceRepository implements FinanceReaderPort, FinanceWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // TRANSACTIONS
  // ---------------------------------------------------------------------------

  public async findTransactionById(id: string): Promise<FinancialTransactionEntity | null> {
    const raw = await this.prisma.financialTransaction.findUnique({ where: { id } });
    return raw ? FinanceMapper.toTransactionEntity(raw) : null;
  }

  public async findTransactionByReference(reference: string): Promise<FinancialTransactionEntity | null> {
    const raw = await this.prisma.financialTransaction.findUnique({ where: { reference } });
    return raw ? FinanceMapper.toTransactionEntity(raw) : null;
  }

  public async listTransactions(filter?: ListTransactionsFilter): Promise<FinancialTransactionEntity[]> {
    const where: any = {};
    if (filter?.associationId) where.associationId = filter.associationId;
    if (filter?.type) where.type = filter.type;
    if (filter?.status) where.status = filter.status;
    if (filter?.category) where.category = filter.category;
    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    const records = await this.prisma.financialTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r: PrismaTransaction) => FinanceMapper.toTransactionEntity(r));
  }

  public async saveTransaction(transaction: FinancialTransactionEntity): Promise<void> {
    await this.prisma.financialTransaction.upsert({
      where: { id: transaction.id },
      create: {
        id: transaction.id,
        associationId: transaction.associationId,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type as any,
        status: transaction.status as any,
        reference: transaction.reference,
        description: transaction.description,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        recordedById: transaction.recordedById,
        createdAt: transaction.createdAt,
      },
      update: {
        status: transaction.status as any,
        description: transaction.description,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // COTISATIONS
  // ---------------------------------------------------------------------------

  public async findCotisationById(id: string): Promise<CotisationEntity | null> {
    const raw = await this.prisma.cotisation.findUnique({ where: { id } });
    return raw ? FinanceMapper.toCotisationEntity(raw) : null;
  }

  public async listCotisations(filter?: ListCotisationsFilter): Promise<CotisationEntity[]> {
    const where: any = {};
    if (filter?.associationId) where.associationId = filter.associationId;
    if (filter?.memberId) where.memberId = filter.memberId;
    if (filter?.period) where.period = filter.period;
    if (filter?.status) where.status = filter.status;

    const records = await this.prisma.cotisation.findMany({
      where,
      orderBy: { paidAt: 'desc' },
    });

    return records.map((r: PrismaCotisation) => FinanceMapper.toCotisationEntity(r));
  }

  public async saveCotisation(cotisation: CotisationEntity): Promise<void> {
    await this.prisma.cotisation.upsert({
      where: { id: cotisation.id },
      create: {
        id: cotisation.id,
        associationId: cotisation.associationId,
        memberId: cotisation.memberId,
        amount: cotisation.amount,
        currency: cotisation.currency,
        period: cotisation.period,
        status: cotisation.status,
        paymentMethod: cotisation.paymentMethod,
        reference: cotisation.reference,
        transactionId: cotisation.transactionId,
        notes: cotisation.notes,
        paidAt: cotisation.paidAt,
        createdAt: cotisation.createdAt,
      },
      update: {
        status: cotisation.status,
        transactionId: cotisation.transactionId,
        notes: cotisation.notes,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // BUILDING LEASES & RENTS
  // ---------------------------------------------------------------------------

  public async findBuildingLeaseById(id: string): Promise<BuildingLeaseEntity | null> {
    const raw = await this.prisma.buildingLease.findUnique({ where: { id } });
    return raw ? FinanceMapper.toBuildingLeaseEntity(raw) : null;
  }

  public async findBuildingLeaseByBuildingId(buildingId: string): Promise<BuildingLeaseEntity | null> {
    const raw = await this.prisma.buildingLease.findUnique({ where: { buildingId } });
    return raw ? FinanceMapper.toBuildingLeaseEntity(raw) : null;
  }

  public async listBuildingLeases(associationId?: string): Promise<BuildingLeaseEntity[]> {
    const records = await this.prisma.buildingLease.findMany({
      where: associationId ? { associationId } : {},
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: PrismaBuildingLease) => FinanceMapper.toBuildingLeaseEntity(r));
  }

  public async saveBuildingLease(lease: BuildingLeaseEntity): Promise<void> {
    await this.prisma.buildingLease.upsert({
      where: { id: lease.id },
      create: {
        id: lease.id,
        buildingId: lease.buildingId,
        associationId: lease.associationId,
        monthlyRentAmount: lease.monthlyRentAmount,
        currency: lease.currency,
        paymentDayOfMonth: lease.paymentDayOfMonth,
        leaseStartDate: lease.leaseStartDate,
        leaseEndDate: lease.leaseEndDate,
        isActive: lease.isActive,
        createdAt: lease.createdAt,
        updatedAt: lease.updatedAt,
      },
      update: {
        monthlyRentAmount: lease.monthlyRentAmount,
        paymentDayOfMonth: lease.paymentDayOfMonth,
        leaseEndDate: lease.leaseEndDate,
        isActive: lease.isActive,
        updatedAt: lease.updatedAt,
      },
    });
  }

  public async findRentExpenseById(id: string): Promise<BuildingRentExpenseEntity | null> {
    const raw = await this.prisma.buildingRentExpense.findUnique({ where: { id } });
    return raw ? FinanceMapper.toBuildingRentExpenseEntity(raw) : null;
  }

  public async listRentExpenses(filter?: ListRentExpensesFilter): Promise<BuildingRentExpenseEntity[]> {
    const where: any = {};
    if (filter?.leaseId) where.leaseId = filter.leaseId;
    if (filter?.monthYear) where.monthYear = filter.monthYear;
    if (filter?.status) where.status = filter.status;

    const records = await this.prisma.buildingRentExpense.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });

    return records.map((r: PrismaBuildingRentExpense) => FinanceMapper.toBuildingRentExpenseEntity(r));
  }

  public async saveRentExpense(rentExpense: BuildingRentExpenseEntity): Promise<void> {
    await this.prisma.buildingRentExpense.upsert({
      where: { id: rentExpense.id },
      create: {
        id: rentExpense.id,
        leaseId: rentExpense.leaseId,
        monthYear: rentExpense.monthYear,
        amount: rentExpense.amount,
        status: rentExpense.status,
        transactionId: rentExpense.transactionId,
        dueDate: rentExpense.dueDate,
        paidAt: rentExpense.paidAt,
        createdAt: rentExpense.createdAt,
      },
      update: {
        status: rentExpense.status,
        transactionId: rentExpense.transactionId,
        paidAt: rentExpense.paidAt,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // INTEGRATION FEES
  // ---------------------------------------------------------------------------

  public async findIntegrationFeePlanById(id: string): Promise<IntegrationFeePlanEntity | null> {
    const raw = await this.prisma.integrationFeePlan.findUnique({ where: { id } });
    return raw ? FinanceMapper.toIntegrationFeePlanEntity(raw) : null;
  }

  public async findIntegrationFeePlanByYear(
    associationId: string,
    academicYear: string,
  ): Promise<IntegrationFeePlanEntity | null> {
    const raw = await this.prisma.integrationFeePlan.findUnique({
      where: {
        associationId_academicYear: {
          associationId,
          academicYear,
        },
      },
    });
    return raw ? FinanceMapper.toIntegrationFeePlanEntity(raw) : null;
  }

  public async listIntegrationFeePlans(associationId?: string): Promise<IntegrationFeePlanEntity[]> {
    const records = await this.prisma.integrationFeePlan.findMany({
      where: associationId ? { associationId } : {},
      orderBy: { academicYear: 'desc' },
    });
    return records.map((r: PrismaIntegrationFeePlan) => FinanceMapper.toIntegrationFeePlanEntity(r));
  }

  public async saveIntegrationFeePlan(plan: IntegrationFeePlanEntity): Promise<void> {
    await this.prisma.integrationFeePlan.upsert({
      where: { id: plan.id },
      create: {
        id: plan.id,
        associationId: plan.associationId,
        academicYear: plan.academicYear,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        installmentsAllowed: plan.installmentsAllowed,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
      update: {
        name: plan.name,
        amount: plan.amount,
        installmentsAllowed: plan.installmentsAllowed,
        updatedAt: plan.updatedAt,
      },
    });
  }

  public async findIntegrationFeeDueById(id: string): Promise<IntegrationFeeDueEntity | null> {
    const raw = await this.prisma.integrationFeeDue.findUnique({ where: { id } });
    return raw ? FinanceMapper.toIntegrationFeeDueEntity(raw) : null;
  }

  public async findIntegrationFeeDueByOccupationId(occupationId: string): Promise<IntegrationFeeDueEntity | null> {
    const raw = await this.prisma.integrationFeeDue.findUnique({ where: { occupationId } });
    return raw ? FinanceMapper.toIntegrationFeeDueEntity(raw) : null;
  }

  public async listIntegrationFeeDues(filter?: ListIntegrationFeeDuesFilter): Promise<IntegrationFeeDueEntity[]> {
    const where: any = {};
    if (filter?.userId) where.userId = filter.userId;
    if (filter?.planId) where.planId = filter.planId;
    if (filter?.status) where.status = filter.status;

    const records = await this.prisma.integrationFeeDue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r: PrismaIntegrationFeeDue) => FinanceMapper.toIntegrationFeeDueEntity(r));
  }

  public async saveIntegrationFeeDue(due: IntegrationFeeDueEntity): Promise<void> {
    await this.prisma.integrationFeeDue.upsert({
      where: { id: due.id },
      create: {
        id: due.id,
        occupationId: due.occupationId,
        userId: due.userId,
        planId: due.planId,
        totalAmount: due.totalAmount,
        paidAmount: due.paidAmount,
        status: due.status,
        dueDate: due.dueDate,
        createdAt: due.createdAt,
        updatedAt: due.updatedAt,
      },
      update: {
        paidAmount: due.paidAmount,
        status: due.status,
        updatedAt: due.updatedAt,
      },
    });
  }

  public async saveIntegrationFeePayment(payment: IntegrationFeePaymentEntity): Promise<void> {
    await this.prisma.integrationFeePayment.create({
      data: {
        id: payment.id,
        dueId: payment.dueId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        receiptReference: payment.receiptReference,
        recordedById: payment.recordedById,
        paidAt: payment.paidAt,
      },
    });
  }

  public async listIntegrationFeeDebtors(associationId?: string): Promise<IntegrationFeeDebtorSummary[]> {
    const dues = await this.prisma.integrationFeeDue.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        ...(associationId ? { plan: { associationId } } : {}),
      },
      include: {
        user: {
          include: { profile: true },
        },
        occupation: {
          include: {
            room: {
              include: {
                building: {
                  include: { quarter: true },
                },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return dues.map((d: any) => {
      const total = Number(d.totalAmount);
      const paid = Number(d.paidAmount);
      const profile = d.user?.profile;
      const userName = profile ? `${profile.firstName} ${profile.lastName}` : (d.user?.phoneNumber || 'Étudiant');

      return {
        dueId: d.id,
        userId: d.userId,
        userName,
        userPhone: d.user?.phoneNumber || '',
        roomNumber: d.occupation?.room?.roomNumber || 'N/A',
        buildingName: d.occupation?.room?.building?.name || 'N/A',
        quarterName: d.occupation?.room?.building?.quarter?.name || 'N/A',
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: Math.max(0, total - paid),
        status: d.status,
        dueDate: d.dueDate,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // DONATIONS
  // ---------------------------------------------------------------------------

  public async findDonationById(id: string): Promise<DonationEntity | null> {
    const raw = await this.prisma.donation.findUnique({ where: { id } });
    return raw ? FinanceMapper.toDonationEntity(raw) : null;
  }

  public async listDonations(filter?: ListDonationsFilter): Promise<DonationEntity[]> {
    const where: any = {};
    if (filter?.associationId) where.associationId = filter.associationId;
    if (filter?.campaignName) where.campaignName = { contains: filter.campaignName, mode: 'insensitive' };
    if (filter?.paymentMethod) where.paymentMethod = filter.paymentMethod;

    const records = await this.prisma.donation.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
    });

    return records.map((r: PrismaDonation) => FinanceMapper.toDonationEntity(r));
  }

  public async saveDonation(donation: DonationEntity): Promise<void> {
    await this.prisma.donation.upsert({
      where: { id: donation.id },
      create: {
        id: donation.id,
        associationId: donation.associationId,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        amount: donation.amount,
        currency: donation.currency,
        paymentMethod: donation.paymentMethod,
        campaignName: donation.campaignName,
        reference: donation.reference,
        transactionId: donation.transactionId,
        notes: donation.notes,
        receivedAt: donation.receivedAt,
        createdAt: donation.createdAt,
      },
      update: {
        transactionId: donation.transactionId,
        notes: donation.notes,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // EXPENSES
  // ---------------------------------------------------------------------------

  public async findExpenseById(id: string): Promise<ExpenseEntity | null> {
    const raw = await this.prisma.expense.findUnique({ where: { id } });
    return raw ? FinanceMapper.toExpenseEntity(raw) : null;
  }

  public async listExpenses(filter?: ListExpensesFilter): Promise<ExpenseEntity[]> {
    const where: any = {};
    if (filter?.associationId) where.associationId = filter.associationId;
    if (filter?.category) where.category = filter.category;
    if (filter?.status) where.status = filter.status;

    const records = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    return records.map((r: PrismaExpense) => FinanceMapper.toExpenseEntity(r));
  }

  public async saveExpense(expense: ExpenseEntity): Promise<void> {
    await this.prisma.expense.upsert({
      where: { id: expense.id },
      create: {
        id: expense.id,
        associationId: expense.associationId,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        beneficiary: expense.beneficiary,
        paymentMethod: expense.paymentMethod,
        status: expense.status,
        receiptRef: expense.receiptRef,
        transactionId: expense.transactionId,
        notes: expense.notes,
        expenseDate: expense.expenseDate,
        recordedById: expense.recordedById,
        createdAt: expense.createdAt,
      },
      update: {
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        beneficiary: expense.beneficiary,
        status: expense.status,
        receiptRef: expense.receiptRef,
        transactionId: expense.transactionId,
        notes: expense.notes,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // STATS & TOTALS
  // ---------------------------------------------------------------------------

  public async getFinanceStats(associationId?: string): Promise<FinanceStats> {
    const whereAssoc = associationId ? { associationId } : {};

    const [transactions, dues, rentExpenses] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where: {
          ...whereAssoc,
          status: 'POSTED',
        },
        select: { type: true, amount: true, category: true, createdAt: true },
      }),
      this.prisma.integrationFeeDue.findMany({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          ...(associationId ? { plan: { associationId } } : {}),
        },
        select: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.buildingRentExpense.findMany({
        where: {
          status: 'PENDING',
          ...(associationId ? { lease: { associationId } } : {}),
        },
        select: { amount: true },
      }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalCotisations = 0;
    let totalDonations = 0;
    let totalIntegrationFees = 0;
    let totalLandlordRents = 0;
    const expensesByCategory: Record<string, number> = {};
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    for (const tx of transactions) {
      const amt = Number(tx.amount);
      const d = new Date(tx.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }

      if (tx.type === 'INCOME') {
        totalIncome += amt;
        monthlyMap[monthKey].income += amt;
        if (tx.category === 'COTISATION') totalCotisations += amt;
        else if (tx.category === 'DON' || tx.category === 'DONATION') totalDonations += amt;
        else if (tx.category === 'INTEGRATION_FEE') totalIntegrationFees += amt;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += amt;
        monthlyMap[monthKey].expense += amt;
        if (tx.category === 'BUILDING_RENT' || tx.category === 'LOYER_BAILLEUR') {
          totalLandlordRents += amt;
        }
        const cat = tx.category || 'AUTRE';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt;
      } else if (tx.type === 'ADJUSTMENT') {
        totalIncome += amt;
      }
    }

    const monthlyBreakdown = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }));

    const pendingIntegrationDues = dues.reduce(
      (sum: number, d: any) => sum + Math.max(0, Number(d.totalAmount) - Number(d.paidAmount)),
      0,
    );

    const pendingBuildingRent = rentExpenses.reduce(
      (sum: number, r: any) => sum + Number(r.amount),
      0,
    );

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
      transactionsCount: transactions.length,
      expensesByCategory,
      monthlyBreakdown,
    };
  }
}


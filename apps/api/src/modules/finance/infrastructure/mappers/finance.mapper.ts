import type {
  FinancialTransaction as PrismaTransaction,
  Cotisation as PrismaCotisation,
  BuildingLease as PrismaBuildingLease,
  BuildingRentExpense as PrismaBuildingRentExpense,
  IntegrationFeePlan as PrismaIntegrationFeePlan,
  IntegrationFeeDue as PrismaIntegrationFeeDue,
  IntegrationFeePayment as PrismaIntegrationFeePayment,
  Donation as PrismaDonation,
  Expense as PrismaExpense,
} from '@prisma/client';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import { CotisationEntity } from '../../domain/entities/cotisation.entity.js';
import { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';
import { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';
import { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';
import { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';
import { IntegrationFeePaymentEntity } from '../../domain/entities/integration-fee-payment.entity.js';
import { DonationEntity } from '../../domain/entities/donation.entity.js';
import { ExpenseEntity } from '../../domain/entities/expense.entity.js';

export class FinanceMapper {
  public static toTransactionEntity(raw: PrismaTransaction): FinancialTransactionEntity {
    return FinancialTransactionEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      amount: Number(raw.amount),
      currency: raw.currency,
      type: raw.type as any,
      status: raw.status as any,
      reference: raw.reference,
      description: raw.description,
      category: raw.category,
      paymentMethod: raw.paymentMethod,
      recordedById: raw.recordedById,
      createdAt: raw.createdAt,
    });
  }

  public static toCotisationEntity(raw: PrismaCotisation): CotisationEntity {
    return CotisationEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      memberId: raw.memberId,
      amount: Number(raw.amount),
      currency: raw.currency,
      period: raw.period,
      status: raw.status,
      paymentMethod: raw.paymentMethod,
      reference: raw.reference,
      transactionId: raw.transactionId,
      notes: raw.notes,
      paidAt: raw.paidAt,
      createdAt: raw.createdAt,
    });
  }

  public static toBuildingLeaseEntity(raw: PrismaBuildingLease): BuildingLeaseEntity {
    return BuildingLeaseEntity.create({
      id: raw.id,
      buildingId: raw.buildingId,
      associationId: raw.associationId,
      monthlyRentAmount: Number(raw.monthlyRentAmount),
      currency: raw.currency,
      paymentDayOfMonth: raw.paymentDayOfMonth,
      leaseStartDate: raw.leaseStartDate,
      leaseEndDate: raw.leaseEndDate,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toBuildingRentExpenseEntity(raw: PrismaBuildingRentExpense): BuildingRentExpenseEntity {
    return BuildingRentExpenseEntity.create({
      id: raw.id,
      leaseId: raw.leaseId,
      monthYear: raw.monthYear,
      amount: Number(raw.amount),
      status: raw.status,
      transactionId: raw.transactionId,
      dueDate: raw.dueDate,
      paidAt: raw.paidAt,
      createdAt: raw.createdAt,
    });
  }

  public static toIntegrationFeePlanEntity(raw: PrismaIntegrationFeePlan): IntegrationFeePlanEntity {
    return IntegrationFeePlanEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      academicYear: raw.academicYear,
      name: raw.name,
      amount: Number(raw.amount),
      currency: raw.currency,
      installmentsAllowed: raw.installmentsAllowed,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toIntegrationFeeDueEntity(raw: PrismaIntegrationFeeDue): IntegrationFeeDueEntity {
    return IntegrationFeeDueEntity.create({
      id: raw.id,
      occupationId: raw.occupationId,
      userId: raw.userId,
      planId: raw.planId,
      totalAmount: Number(raw.totalAmount),
      paidAmount: Number(raw.paidAmount),
      status: raw.status,
      dueDate: raw.dueDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toIntegrationFeePaymentEntity(raw: PrismaIntegrationFeePayment): IntegrationFeePaymentEntity {
    return IntegrationFeePaymentEntity.create({
      id: raw.id,
      dueId: raw.dueId,
      transactionId: raw.transactionId,
      amount: Number(raw.amount),
      paymentMethod: raw.paymentMethod,
      receiptReference: raw.receiptReference,
      recordedById: raw.recordedById,
      paidAt: raw.paidAt,
    });
  }

  public static toDonationEntity(raw: PrismaDonation): DonationEntity {
    return DonationEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      donorName: raw.donorName,
      donorEmail: raw.donorEmail,
      donorPhone: raw.donorPhone,
      amount: Number(raw.amount),
      currency: raw.currency,
      paymentMethod: raw.paymentMethod,
      campaignName: raw.campaignName,
      reference: raw.reference,
      transactionId: raw.transactionId,
      notes: raw.notes,
      receivedAt: raw.receivedAt,
      createdAt: raw.createdAt,
    });
  }

  public static toExpenseEntity(raw: PrismaExpense): ExpenseEntity {
    return ExpenseEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      title: raw.title,
      category: raw.category,
      amount: Number(raw.amount),
      currency: raw.currency,
      beneficiary: raw.beneficiary,
      paymentMethod: raw.paymentMethod,
      status: raw.status as any,
      receiptRef: raw.receiptRef,
      transactionId: raw.transactionId,
      notes: raw.notes,
      expenseDate: raw.expenseDate,
      recordedById: raw.recordedById,
      createdAt: raw.createdAt,
    });
  }
}


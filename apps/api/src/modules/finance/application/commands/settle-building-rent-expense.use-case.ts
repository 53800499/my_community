import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
} from '../ports/finance-reader.port.js';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import { BuildingRentPaidEvent, TransactionPostedEvent } from '../../domain/events/finance.events.js';
import type { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';

export interface SettleBuildingRentExpenseCommand {
  expenseId: string;
  paymentMethod?: string;
  recordedById: string;
  notes?: string | null;
}

@Injectable()
export class SettleBuildingRentExpenseUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: SettleBuildingRentExpenseCommand): Promise<BuildingRentExpenseEntity> {
    const expense = await this.reader.findRentExpenseById(command.expenseId);
    if (!expense) {
      throw new NotFoundException(`Échéance de loyer introuvable avec l'ID: ${command.expenseId}`);
    }

    if (expense.status === 'PAID') {
      throw new BadRequestException('Cette charge de loyer est déjà marquée comme payée.');
    }

    const lease = await this.reader.findBuildingLeaseById(expense.leaseId);

    // 1. Post EXPENSE in financial ledger
    const tx = FinancialTransactionEntity.create({
      associationId: lease?.associationId ?? null,
      amount: expense.amount,
      type: 'EXPENSE',
      category: 'LOYER_BAILLEUR',
      paymentMethod: command.paymentMethod ?? 'BANK_TRANSFER',
      description: `Règlement loyer bailleur échéance ${expense.monthYear}${command.notes ? ` - ${command.notes}` : ''}`,
      recordedById: command.recordedById,
    });

    await this.writer.saveTransaction(tx);

    // 2. Mark expense as PAID
    expense.markAsPaid(tx.id);
    await this.writer.saveRentExpense(expense);

    this.eventEmitter.emit(
      TransactionPostedEvent.EVENT_NAME,
      new TransactionPostedEvent(
        tx.id,
        tx.associationId,
        tx.amount,
        tx.type,
        tx.reference,
        tx.recordedById,
      ),
    );

    this.eventEmitter.emit(
      BuildingRentPaidEvent.EVENT_NAME,
      new BuildingRentPaidEvent(
        expense.id,
        expense.leaseId,
        expense.monthYear,
        expense.amount,
        tx.id,
      ),
    );

    return expense;
  }
}

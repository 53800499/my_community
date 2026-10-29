import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { TransactionPostedEvent } from '../../domain/events/finance.events.js';
import type { ExpenseEntity } from '../../domain/entities/expense.entity.js';

export interface ApproveExpenseCommand {
  expenseId: string;
  approvedById: string;
}

@Injectable()
export class ApproveExpenseUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: ApproveExpenseCommand): Promise<ExpenseEntity> {
    const expense = await this.reader.findExpenseById(command.expenseId);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable avec l'identifiant ${command.expenseId}`);
    }

    if (expense.status === 'PAID') {
      throw new ConflictException('Cette dépense a déjà été approuvée et décaissée.');
    }

    if (expense.status === 'REJECTED') {
      throw new ConflictException('Cette dépense a été rejetée et ne peut pas être approuvée.');
    }

    const tx = FinancialTransactionEntity.create({
      associationId: expense.associationId,
      amount: expense.amount,
      currency: expense.currency,
      type: 'EXPENSE',
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      description: `Décaissement validé: ${expense.title} (Bénéficiaire: ${expense.beneficiary})`,
      recordedById: command.approvedById,
    });

    await this.writer.saveTransaction(tx);

    expense.approve(tx.id);
    await this.writer.saveExpense(expense);

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

    return expense;
  }
}

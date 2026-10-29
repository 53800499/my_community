import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { ExpenseEntity, type ExpenseStatus } from '../../domain/entities/expense.entity.js';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import { ExpenseRecordedEvent, TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface RecordExpenseCommand {
  associationId: string;
  title: string;
  category: string; // LOGISTIQUE, LOYER_BAILLEUR, EVENEMENT, EQUIPEMENT, AIDE_SOCIALE, AUTRE
  amount: number;
  currency?: string;
  beneficiary: string;
  paymentMethod?: string;
  status?: ExpenseStatus;
  receiptRef?: string | null;
  notes?: string | null;
  recordedById: string;
}

@Injectable()
export class RecordExpenseUseCase {
  constructor(
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: RecordExpenseCommand): Promise<ExpenseEntity> {
    const isDirectPaid = command.status === 'PAID' || !command.status;
    let transactionId: string | null = null;

    if (isDirectPaid) {
      const tx = FinancialTransactionEntity.create({
        associationId: command.associationId,
        amount: command.amount,
        currency: command.currency ?? 'XOF',
        type: 'EXPENSE',
        category: command.category,
        paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
        description: `Dépense: ${command.title} (Bénéficiaire: ${command.beneficiary})`,
        recordedById: command.recordedById,
      });

      await this.writer.saveTransaction(tx);
      transactionId = tx.id;

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
    }

    const expense = ExpenseEntity.create({
      associationId: command.associationId,
      title: command.title,
      category: command.category,
      amount: command.amount,
      currency: command.currency ?? 'XOF',
      beneficiary: command.beneficiary,
      paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
      status: isDirectPaid ? 'PAID' : (command.status ?? 'PENDING_APPROVAL'),
      receiptRef: command.receiptRef,
      transactionId,
      notes: command.notes,
      recordedById: command.recordedById,
    });

    await this.writer.saveExpense(expense);

    this.eventEmitter.emit(
      ExpenseRecordedEvent.EVENT_NAME,
      new ExpenseRecordedEvent(
        expense.id,
        expense.associationId,
        expense.category,
        expense.amount,
        expense.transactionId,
      ),
    );

    return expense;
  }
}

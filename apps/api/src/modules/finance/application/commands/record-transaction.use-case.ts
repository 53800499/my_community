import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import {
  FinancialTransactionEntity,
  type TransactionType,
} from '../../domain/entities/financial-transaction.entity.js';
import { TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface RecordTransactionCommand {
  associationId?: string | null;
  amount: number;
  type: TransactionType;
  reference?: string | null;
  description?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  recordedById: string;
}

@Injectable()
export class RecordTransactionUseCase {
  constructor(
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: RecordTransactionCommand): Promise<FinancialTransactionEntity> {
    const tx = FinancialTransactionEntity.create({
      associationId: command.associationId,
      amount: command.amount,
      type: command.type,
      reference: command.reference,
      description: command.description,
      category: command.category,
      paymentMethod: command.paymentMethod,
      recordedById: command.recordedById,
    });

    await this.writer.saveTransaction(tx);

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

    return tx;
  }
}

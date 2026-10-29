import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { CotisationEntity } from '../../domain/entities/cotisation.entity.js';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import { CotisationRecordedEvent, TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface RecordCotisationCommand {
  associationId: string;
  memberId: string;
  amount: number;
  period: string; // e.g. "2026-10"
  paymentMethod?: string;
  notes?: string | null;
  recordedById: string;
}

@Injectable()
export class RecordCotisationUseCase {
  constructor(
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: RecordCotisationCommand): Promise<CotisationEntity> {
    const tx = FinancialTransactionEntity.create({
      associationId: command.associationId,
      amount: command.amount,
      type: 'INCOME',
      category: 'COTISATION',
      paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
      description: `Cotisation membre (${command.period})`,
      recordedById: command.recordedById,
    });

    await this.writer.saveTransaction(tx);

    const cotisation = CotisationEntity.create({
      associationId: command.associationId,
      memberId: command.memberId,
      amount: command.amount,
      period: command.period,
      status: 'PAID',
      paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
      transactionId: tx.id,
      notes: command.notes,
    });

    await this.writer.saveCotisation(cotisation);

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
      CotisationRecordedEvent.EVENT_NAME,
      new CotisationRecordedEvent(
        cotisation.id,
        cotisation.associationId,
        cotisation.memberId,
        cotisation.amount,
        cotisation.period,
        cotisation.reference,
      ),
    );

    return cotisation;
  }
}

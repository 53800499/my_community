import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { FinancialImmutabilityPolicy } from '../../domain/policies/financial-immutability.policy.js';
import { TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface CreateAdjustmentCommand {
  originalTransactionId: string;
  adjustmentAmount: number;
  reason: string;
  recordedById: string;
}

@Injectable()
export class CreateAdjustmentUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: CreateAdjustmentCommand): Promise<FinancialTransactionEntity> {
    const originalTx = await this.reader.findTransactionById(command.originalTransactionId);
    if (!originalTx) {
      throw new NotFoundException(`Transaction originale introuvable avec l'ID: ${command.originalTransactionId}`);
    }

    FinancialImmutabilityPolicy.assertCanBeAdjusted(originalTx);

    const adjustmentTx = FinancialTransactionEntity.createAdjustment(
      originalTx,
      command.adjustmentAmount,
      command.reason,
      command.recordedById,
    );

    await this.writer.saveTransaction(adjustmentTx);

    this.eventEmitter.emit(
      TransactionPostedEvent.EVENT_NAME,
      new TransactionPostedEvent(
        adjustmentTx.id,
        adjustmentTx.associationId,
        adjustmentTx.amount,
        adjustmentTx.type,
        adjustmentTx.reference,
        adjustmentTx.recordedById,
      ),
    );

    return adjustmentTx;
  }
}

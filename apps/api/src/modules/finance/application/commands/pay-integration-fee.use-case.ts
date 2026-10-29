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
import { IntegrationFeePaymentEntity } from '../../domain/entities/integration-fee-payment.entity.js';
import { IntegrationFeePaidEvent, TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface PayIntegrationFeeCommand {
  dueId: string;
  amount: number;
  paymentMethod: string; // CASH, MOBILE_MONEY, BANK_TRANSFER
  recordedById: string;
}

export interface PayIntegrationFeeResult {
  payment: IntegrationFeePaymentEntity;
  transaction: FinancialTransactionEntity;
  remainingAmount: number;
  dueStatus: string;
}

@Injectable()
export class PayIntegrationFeeUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: PayIntegrationFeeCommand): Promise<PayIntegrationFeeResult> {
    const due = await this.reader.findIntegrationFeeDueById(command.dueId);
    if (!due) {
      throw new NotFoundException(`Appel de frais d'intégration introuvable avec l'ID: ${command.dueId}`);
    }

    if (due.status === 'SETTLED') {
      throw new BadRequestException("Ces frais d'intégration sont déjà totalement soldés.");
    }

    if (command.amount <= 0) {
      throw new BadRequestException('Le montant du versement doit être supérieur à zéro.');
    }

    if (command.amount > due.remainingAmount) {
      throw new BadRequestException(
        `Le montant (${command.amount} XOF) dépasse le restant dû (${due.remainingAmount} XOF).`,
      );
    }

    // Retrieve plan to get associationId
    const plan = await this.reader.findIntegrationFeePlanById(due.planId);

    // 1. Post INCOME in financial ledger
    const tx = FinancialTransactionEntity.create({
      associationId: plan?.associationId ?? null,
      amount: command.amount,
      type: 'INCOME',
      category: 'FRAIS_INTEGRATION',
      paymentMethod: command.paymentMethod,
      description: `Versement frais d'intégration (Contrat ${due.occupationId.slice(0, 8)})`,
      recordedById: command.recordedById,
    });

    await this.writer.saveTransaction(tx);

    // 2. Update due paidAmount and status
    due.recordPayment(command.amount);
    await this.writer.saveIntegrationFeeDue(due);

    // 3. Create payment receipt
    const payment = IntegrationFeePaymentEntity.create({
      dueId: due.id,
      transactionId: tx.id,
      amount: command.amount,
      paymentMethod: command.paymentMethod,
      recordedById: command.recordedById,
    });

    await this.writer.saveIntegrationFeePayment(payment);

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
      IntegrationFeePaidEvent.EVENT_NAME,
      new IntegrationFeePaidEvent(
        payment.id,
        due.id,
        due.userId,
        payment.amount,
        due.remainingAmount,
        payment.receiptReference,
      ),
    );

    return {
      payment,
      transaction: tx,
      remainingAmount: due.remainingAmount,
      dueStatus: due.status,
    };
  }
}

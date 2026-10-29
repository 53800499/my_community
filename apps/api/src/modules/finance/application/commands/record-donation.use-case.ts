import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { DonationEntity } from '../../domain/entities/donation.entity.js';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';
import { DonationReceivedEvent, TransactionPostedEvent } from '../../domain/events/finance.events.js';

export interface RecordDonationCommand {
  associationId: string;
  donorName: string;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  campaignName?: string | null;
  notes?: string | null;
  recordedById: string;
}

@Injectable()
export class RecordDonationUseCase {
  constructor(
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(command: RecordDonationCommand): Promise<DonationEntity> {
    const tx = FinancialTransactionEntity.create({
      associationId: command.associationId,
      amount: command.amount,
      currency: command.currency ?? 'XOF',
      type: 'INCOME',
      category: 'DON',
      paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
      description: `Don reçu de ${command.donorName}${command.campaignName ? ` - Campagne: ${command.campaignName}` : ''}`,
      recordedById: command.recordedById,
    });

    await this.writer.saveTransaction(tx);

    const donation = DonationEntity.create({
      associationId: command.associationId,
      donorName: command.donorName,
      donorEmail: command.donorEmail,
      donorPhone: command.donorPhone,
      amount: command.amount,
      currency: command.currency ?? 'XOF',
      paymentMethod: command.paymentMethod ?? 'MOBILE_MONEY',
      campaignName: command.campaignName,
      transactionId: tx.id,
      notes: command.notes,
    });

    await this.writer.saveDonation(donation);

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
      DonationReceivedEvent.EVENT_NAME,
      new DonationReceivedEvent(
        donation.id,
        donation.associationId,
        donation.donorName,
        donation.amount,
        donation.reference,
      ),
    );

    return donation;
  }
}

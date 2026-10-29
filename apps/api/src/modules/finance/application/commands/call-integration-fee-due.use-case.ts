import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
} from '../ports/finance-reader.port.js';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';

export interface CallIntegrationFeeDueCommand {
  occupationId: string;
  userId: string;
  planId: string;
  dueDate?: Date;
}

@Injectable()
export class CallIntegrationFeeDueUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
  ) {}

  public async execute(command: CallIntegrationFeeDueCommand): Promise<IntegrationFeeDueEntity> {
    const existing = await this.reader.findIntegrationFeeDueByOccupationId(command.occupationId);
    if (existing) {
      throw new ConflictException(
        "Des frais d'intégration ont déjà été appelés pour ce contrat de résidence.",
      );
    }

    const plan = await this.reader.findIntegrationFeePlanById(command.planId);
    if (!plan) {
      throw new NotFoundException(`Barème de frais d'intégration introuvable avec l'ID: ${command.planId}`);
    }

    // Default due date: 30 days from now
    const dueDate = command.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const due = IntegrationFeeDueEntity.create({
      occupationId: command.occupationId,
      userId: command.userId,
      planId: plan.id,
      totalAmount: plan.amount,
      paidAmount: 0,
      dueDate,
    });

    await this.writer.saveIntegrationFeeDue(due);

    return due;
  }
}

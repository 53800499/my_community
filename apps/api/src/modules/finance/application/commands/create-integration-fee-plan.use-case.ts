import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
} from '../ports/finance-reader.port.js';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';

export interface CreateIntegrationFeePlanCommand {
  associationId: string;
  academicYear: string; // '2026-2027'
  name: string;
  amount: number;
  installmentsAllowed?: number;
}

@Injectable()
export class CreateIntegrationFeePlanUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
  ) {}

  public async execute(command: CreateIntegrationFeePlanCommand): Promise<IntegrationFeePlanEntity> {
    const existing = await this.reader.findIntegrationFeePlanByYear(
      command.associationId,
      command.academicYear,
    );
    if (existing) {
      throw new ConflictException(
        `Un barème d'intégration existe déjà pour l'année universitaire ${command.academicYear}.`,
      );
    }

    const plan = IntegrationFeePlanEntity.create({
      associationId: command.associationId,
      academicYear: command.academicYear,
      name: command.name,
      amount: command.amount,
      installmentsAllowed: command.installmentsAllowed,
    });

    await this.writer.saveIntegrationFeePlan(plan);

    return plan;
  }
}

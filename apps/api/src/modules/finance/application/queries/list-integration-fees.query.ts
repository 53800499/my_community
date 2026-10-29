import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type IntegrationFeeDebtorSummary,
  type ListIntegrationFeeDuesFilter,
} from '../ports/finance-reader.port.js';
import type { IntegrationFeePlanEntity } from '../../domain/entities/integration-fee-plan.entity.js';
import type { IntegrationFeeDueEntity } from '../../domain/entities/integration-fee-due.entity.js';

@Injectable()
export class ListIntegrationFeePlansQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<IntegrationFeePlanEntity[]> {
    return this.reader.listIntegrationFeePlans(associationId);
  }
}

@Injectable()
export class ListIntegrationFeeDuesQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListIntegrationFeeDuesFilter): Promise<IntegrationFeeDueEntity[]> {
    return this.reader.listIntegrationFeeDues(filter);
  }
}

@Injectable()
export class GetIntegrationFeeDebtorsQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<IntegrationFeeDebtorSummary[]> {
    return this.reader.listIntegrationFeeDebtors(associationId);
  }
}

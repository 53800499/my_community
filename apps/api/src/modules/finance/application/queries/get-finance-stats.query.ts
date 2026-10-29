import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type FinanceStats,
} from '../ports/finance-reader.port.js';

@Injectable()
export class GetFinanceStatsQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<FinanceStats> {
    return this.reader.getFinanceStats(associationId);
  }
}

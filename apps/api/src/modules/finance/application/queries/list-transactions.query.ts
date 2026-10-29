import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type ListTransactionsFilter,
} from '../ports/finance-reader.port.js';
import type { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity.js';

@Injectable()
export class ListTransactionsQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListTransactionsFilter): Promise<FinancialTransactionEntity[]> {
    return this.reader.listTransactions(filter);
  }
}

@Injectable()
export class GetTransactionByIdQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(id: string): Promise<FinancialTransactionEntity | null> {
    return this.reader.findTransactionById(id);
  }
}

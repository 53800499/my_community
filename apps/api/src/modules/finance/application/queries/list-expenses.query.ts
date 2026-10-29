import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type ListExpensesFilter,
} from '../ports/finance-reader.port.js';
import type { ExpenseEntity } from '../../domain/entities/expense.entity.js';

@Injectable()
export class ListExpensesQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListExpensesFilter): Promise<ExpenseEntity[]> {
    return this.reader.listExpenses(filter);
  }
}

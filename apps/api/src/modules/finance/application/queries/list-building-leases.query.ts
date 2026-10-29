import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type ListRentExpensesFilter,
} from '../ports/finance-reader.port.js';
import type { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';
import type { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';

@Injectable()
export class ListBuildingLeasesQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<BuildingLeaseEntity[]> {
    return this.reader.listBuildingLeases(associationId);
  }
}

@Injectable()
export class ListBuildingRentExpensesQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListRentExpensesFilter): Promise<BuildingRentExpenseEntity[]> {
    return this.reader.listRentExpenses(filter);
  }
}

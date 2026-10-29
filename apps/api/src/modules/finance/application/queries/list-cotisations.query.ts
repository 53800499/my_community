import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type ListCotisationsFilter,
} from '../ports/finance-reader.port.js';
import type { CotisationEntity } from '../../domain/entities/cotisation.entity.js';

@Injectable()
export class ListCotisationsQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListCotisationsFilter): Promise<CotisationEntity[]> {
    return this.reader.listCotisations(filter);
  }
}

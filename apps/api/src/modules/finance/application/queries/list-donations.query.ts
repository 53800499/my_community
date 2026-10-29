import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
  type ListDonationsFilter,
} from '../ports/finance-reader.port.js';
import type { DonationEntity } from '../../domain/entities/donation.entity.js';

@Injectable()
export class ListDonationsQuery {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
  ) {}

  public async execute(filter?: ListDonationsFilter): Promise<DonationEntity[]> {
    return this.reader.listDonations(filter);
  }
}

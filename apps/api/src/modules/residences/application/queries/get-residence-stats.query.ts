import { Inject, Injectable } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
  type ResidenceStats,
} from '../ports/residence-reader.port.js';

@Injectable()
export class GetResidenceStatsQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<ResidenceStats> {
    return this.reader.getStats(associationId);
  }
}

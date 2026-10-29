import { Inject, Injectable } from '@nestjs/common';
import type { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';

@Injectable()
export class ListQuartersQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(associationId?: string): Promise<QuarterEntity[]> {
    return this.reader.listQuartersByAssociation(associationId);
  }
}

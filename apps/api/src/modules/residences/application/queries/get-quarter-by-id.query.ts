import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';
import type { QuarterEntity } from '../../domain/entities/quarter.entity.js';

@Injectable()
export class GetQuarterByIdQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(id: string): Promise<QuarterEntity> {
    const quarter = await this.reader.findQuarterById(id);
    if (!quarter) {
      throw new NotFoundException(`Le quartier avec l'ID ${id} est introuvable.`);
    }
    return quarter;
  }
}

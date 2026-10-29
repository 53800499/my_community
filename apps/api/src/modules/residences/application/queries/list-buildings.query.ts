import { Inject, Injectable } from '@nestjs/common';
import type { BuildingEntity } from '../../domain/entities/building.entity.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';

@Injectable()
export class ListBuildingsQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(quarterId?: string): Promise<BuildingEntity[]> {
    return this.reader.listBuildingsByQuarter(quarterId);
  }
}

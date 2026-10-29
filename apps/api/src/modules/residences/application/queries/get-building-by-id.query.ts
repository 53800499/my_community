import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';
import type { BuildingEntity } from '../../domain/entities/building.entity.js';

@Injectable()
export class GetBuildingByIdQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(id: string): Promise<BuildingEntity> {
    const building = await this.reader.findBuildingById(id);
    if (!building) {
      throw new NotFoundException(`Le bâtiment avec l'ID ${id} est introuvable.`);
    }
    return building;
  }
}

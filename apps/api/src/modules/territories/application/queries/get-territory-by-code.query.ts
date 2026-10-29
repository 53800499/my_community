import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TerritoryEntity } from '../../domain/entities/territory.entity.js';
import {
  TerritoryReaderPort,
  TERRITORY_READER_PORT,
} from '../ports/territory-reader.port.js';

export interface GetTerritoryByCodeInput {
  code: string;
}

@Injectable()
export class GetTerritoryByCodeQuery {
  constructor(
    @Inject(TERRITORY_READER_PORT)
    private readonly territoryReader: TerritoryReaderPort,
  ) {}

  async execute(input: GetTerritoryByCodeInput): Promise<TerritoryEntity> {
    const territory = await this.territoryReader.findByCode(input.code);
    if (!territory) {
      throw new NotFoundException(`Territoire introuvable pour le code ${input.code}`);
    }
    return territory;
  }
}

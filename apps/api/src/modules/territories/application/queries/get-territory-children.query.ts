import { Injectable, Inject } from '@nestjs/common';
import { TerritoryEntity } from '../../domain/entities/territory.entity.js';
import {
  TerritoryReaderPort,
  TERRITORY_READER_PORT,
} from '../ports/territory-reader.port.js';

export interface GetTerritoryChildrenInput {
  parentId: string;
}

/**
 * Cas d'Utilisation de Lecture (Query) : Liste des territoires enfants
 * Conforme SOLID :
 * - SRP : Dédié uniquement à l'extraction des enfants d'un territoire.
 * - ISP : Dépend STRICTEMENT de TerritoryReaderPort.
 */
@Injectable()
export class GetTerritoryChildrenQuery {
  constructor(
    @Inject(TERRITORY_READER_PORT)
    private readonly territoryReader: TerritoryReaderPort,
  ) {}

  async execute(input: GetTerritoryChildrenInput): Promise<TerritoryEntity[]> {
    return this.territoryReader.listChildren(input.parentId);
  }
}

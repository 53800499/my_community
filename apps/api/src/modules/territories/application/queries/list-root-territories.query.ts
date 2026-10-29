import { Injectable, Inject } from '@nestjs/common';
import { TerritoryEntity } from '../../domain/entities/territory.entity.js';
import {
  TerritoryReaderPort,
  TERRITORY_READER_PORT,
} from '../ports/territory-reader.port.js';

/**
 * Cas d'Utilisation de Lecture (Query) : Liste des territoires racines (Pays)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la récupération des territoires de premier niveau.
 * - ISP : Dépend uniquement de TerritoryReaderPort.
 */
@Injectable()
export class ListRootTerritoriesQuery {
  constructor(
    @Inject(TERRITORY_READER_PORT)
    private readonly territoryReader: TerritoryReaderPort,
  ) {}

  async execute(): Promise<TerritoryEntity[]> {
    return this.territoryReader.listRoots();
  }
}

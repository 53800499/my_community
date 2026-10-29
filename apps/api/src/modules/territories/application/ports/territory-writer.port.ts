import { TerritoryEntity } from '../../domain/entities/territory.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Modification du Référentiel Territorial
 * Conforme ISP : Dédié uniquement aux opérations de mutation et persistance.
 */
export abstract class TerritoryWriterPort {
  abstract save(territory: TerritoryEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

export const TERRITORY_WRITER_PORT = Symbol('TERRITORY_WRITER_PORT');

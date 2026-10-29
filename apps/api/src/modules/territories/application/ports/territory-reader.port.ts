import { TerritoryEntity } from '../../domain/entities/territory.entity.js';

/**
 * Port Sortant Hexagonal : Consultation du Référentiel Territorial
 * Conforme ISP : Dédié uniquement aux opérations de lecture et parcours de la hiérarchie.
 */
export abstract class TerritoryReaderPort {
  abstract findById(id: string): Promise<TerritoryEntity | null>;
  abstract findByCode(code: string): Promise<TerritoryEntity | null>;
  abstract listRoots(): Promise<TerritoryEntity[]>;
  abstract listChildren(parentId: string): Promise<TerritoryEntity[]>;
}

export const TERRITORY_READER_PORT = Symbol('TERRITORY_READER_PORT');

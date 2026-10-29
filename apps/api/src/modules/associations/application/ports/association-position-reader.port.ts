import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Postes Associatifs (ISP)
 */
export abstract class AssociationPositionReaderPort {
  abstract listPositions(associationId: string): Promise<AssociationPositionEntity[]>;
  abstract findPositionById(
    associationId: string,
    positionId: string,
  ): Promise<AssociationPositionEntity | null>;
}

export const ASSOCIATION_POSITION_READER_PORT = Symbol('ASSOCIATION_POSITION_READER_PORT');

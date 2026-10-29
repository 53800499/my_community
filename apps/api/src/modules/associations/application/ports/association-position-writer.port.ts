import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation des Postes Associatifs (ISP)
 */
export abstract class AssociationPositionWriterPort {
  abstract savePosition(position: AssociationPositionEntity): Promise<void>;
  abstract updatePosition(position: AssociationPositionEntity): Promise<void>;
  abstract deletePosition(associationId: string, positionId: string): Promise<void>;
}

export const ASSOCIATION_POSITION_WRITER_PORT = Symbol('ASSOCIATION_POSITION_WRITER_PORT');

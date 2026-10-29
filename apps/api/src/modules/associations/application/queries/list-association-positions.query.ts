import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationPositionReaderPort,
  ASSOCIATION_POSITION_READER_PORT,
} from '../ports/association-position-reader.port.js';

/**
 * Cas d'Usage de Lecture (Query) : Consultation de l'Organigramme des Postes d'une Association (SRP)
 */
@Injectable()
export class ListAssociationPositionsQuery {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_POSITION_READER_PORT)
    private readonly positionReader: AssociationPositionReaderPort,
  ) {}

  async execute(associationId: string): Promise<AssociationPositionEntity[]> {
    const association = await this.assocReader.findById(associationId);
    if (!association) {
      throw new NotFoundException('Association introuvable.');
    }

    return this.positionReader.listPositions(associationId);
  }
}

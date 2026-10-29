import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';
import {
  type AssociationMandateReaderPort,
  ASSOCIATION_MANDATE_READER_PORT,
} from '../ports/association-mandate-reader.port.js';

/**
 * Requête Applicative : Historique Global des Mandats d'une Association (ISP / SRP)
 * Permet la traçabilité complète de toutes les mandatures successives.
 */
@Injectable()
export class ListAssociationMandatesQuery {
  constructor(
    @Inject(ASSOCIATION_MANDATE_READER_PORT)
    private readonly mandateReader: AssociationMandateReaderPort,
  ) {}

  async execute(associationId: string): Promise<AssociationMandateEntity[]> {
    if (!associationId || associationId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de l'association est obligatoire.");
    }
    return this.mandateReader.listMandates(associationId);
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CommunityEntity } from '../../domain/entities/community.entity.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';

export interface GetCommunityQueryInput {
  communityId: string;
}

/**
 * Cas d'Utilisation de Lecture (Query) : Recherche d'une Communauté
 *
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la projection/lecture d'une communauté.
 * - ISP : Dépend STRICTEMENT de CommunityReaderPort. N'a aucun accès aux mutations d'écriture.
 * - DIP : Dépend de l'abstraction de lecture injectée via COMMUNITY_READER_PORT.
 */
@Injectable()
export class GetCommunityQuery {
  constructor(
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader: CommunityReaderPort,
  ) {}

  async execute(input: GetCommunityQueryInput): Promise<CommunityEntity> {
    const community = await this.communityReader.findById(input.communityId);
    if (!community) {
      throw new NotFoundException(`Communauté introuvable : ${input.communityId}`);
    }
    return community;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { CommunityEntity } from '../../domain/entities/community.entity.js';
import {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';

/**
 * Cas d'Usage de Consultation : Liste de toutes les Communautés Actives
 */
@Injectable()
export class ListCommunitiesQuery {
  constructor(
    @Inject(COMMUNITY_READER_PORT)
    private readonly reader: CommunityReaderPort,
  ) {}

  async execute(): Promise<CommunityEntity[]> {
    return this.reader.listAll();
  }
}

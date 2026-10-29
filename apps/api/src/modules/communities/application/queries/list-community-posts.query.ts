import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity.js';
import {
  type PostReaderPort,
  POST_READER_PORT,
} from '../ports/post-reader.port.js';
import {
  type CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';

export interface ListCommunityPostsParams {
  communityId: string;
  limit?: number;
  offset?: number;
}

/**
 * Cas d'Usage de Consultation : Liste des publications d'une communauté spécifique
 * Conforme SOLID : SRP (uniquement la requête de lecture), DIP.
 */
@Injectable()
export class ListCommunityPostsQuery {
  constructor(
    @Inject(POST_READER_PORT)
    private readonly postReader: PostReaderPort,
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader: CommunityReaderPort,
  ) {}

  async execute(params: ListCommunityPostsParams): Promise<PostEntity[]> {
    const community = await this.communityReader.findById(params.communityId);
    if (!community) {
      throw new NotFoundException(`La communauté ${params.communityId} n'existe pas.`);
    }

    return this.postReader.listByCommunity(
      params.communityId,
      params.limit,
      params.offset,
    );
  }
}
